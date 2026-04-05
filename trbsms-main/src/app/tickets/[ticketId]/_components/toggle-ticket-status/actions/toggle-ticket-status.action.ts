"use server";

import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import { z } from "zod";
import ticketIdExistsValidator from "../../validators/ticket-id-exists.validator";
import db from "@/db";
import { TicketModel } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import pusher from "@/lib/utils/pusher";

export default async function toggleTicketStatusAction(
  uData: unknown,
): Promise<ResponseWraper<unknown>> {
  try {
    const auth = getAuth();
    await validateUser(auth);

    const ticketId = await parseData(uData);

    const payload = await auth.getPayload();

    const { agentId, userId } = await toggleTicketStatus(payload.id, ticketId);

    await refresh({ ticketId, agentId, userId });

    return { success: true };
  } catch (e) {
    if (e instanceof UnloggingError)
      return { success: false, message: e.message };

    console.trace(e);

    return { success: false, message: "Internal server error" };
  }
}

async function toggleTicketStatus(
  userId: number,
  ticketId: number,
): Promise<{ agentId: number | null; userId: number }> {
  return await db
    .update(TicketModel)

    .set({
      status: sql`CASE
        WHEN ${TicketModel.status} = 'closed'
        THEN 'opened'::ticket_status
        ELSE 'closed'::ticket_status
      END`,
    })
    .where(
      and(
        eq(TicketModel.id, ticketId),
        // or(eq(TicketModel.userId, userId), eq(TicketModel.agentId, userId)),
        sql`((${TicketModel.userId} = ${userId}::int AND ${TicketModel.status} = 'opened') OR (${TicketModel.agentId} = ${userId}::int))`,
      ),
    )
    .returning({ agentId: TicketModel.agentId, userId: TicketModel.userId })
    .then((r) => r.at(0) || { agentId: null, userId: 0 });
}

async function validateUser(auth: ReturnType<typeof getAuth>) {
  if (!(await auth.verify([]))) throw new UnloggingError("Unauthorized.");
}

async function parseData(data: unknown) {
  try {
    return await z.coerce
      .number()
      .min(1)
      .superRefine(async (id, ctx) => {
        const message = await ticketIdExistsValidator(id);

        if (!!message) return ctx.addIssue({ message, code: "custom" });
      })
      .parseAsync(data);
  } catch {
    throw new UnloggingError("Invalid request.");
  }
}

async function refresh({
  userId,
  agentId,
  ticketId,
}: {
  ticketId: number;
  userId: number;
  agentId: number | null;
}) {
  pusher({
    page: `/tickets/chat/ticket-info/${ticketId}/refresh`,
    to: `user-${userId}`,
  });
  pusher({
    page: "/tickets/my-tickets/refresh",
    to: `user-${userId}`,
  });
  pusher({
    page: "tickets/notification/count",
    to: `user-${userId}`,
  });

  if (!!agentId) {
    pusher({
      page: `/tickets/chat/ticket-info/${ticketId}/refresh`,
      to: `user-${agentId}`,
    });
    pusher({
      page: "/tickets/my-tickets/refresh",
      to: `user-${agentId}`,
    });
    pusher({
      page: "tickets/notification/count",
      to: `user-${agentId}`,
    });
  }
}
