"use server";

import {
  TicketMessageModel,
  TicketMessageSeenByModel,
  TicketModel,
} from "@/db/schema";
import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import { z } from "zod";
import ticketIdExistsValidator from "../validators/ticket-id-exists.validator";
import db from "@/db";
import { and, eq, isNull } from "drizzle-orm";
import pusher from "@/lib/utils/pusher";

export type Status = (typeof TicketModel.status.enumValues)[number];

export default async function getTicketInfoAction(
  data: unknown,
): Promise<
  ResponseWraper<{ status: Status; agentId: number | null; userId: number }>
> {
  try {
    const auth = getAuth();
    await validateUser(auth);

    const ticketId = await parseData(data);

    const payload = await auth.getPayload();

    const { agentId, status, userId } = await getTicketInfo(ticketId);

    await updateSeenBy(payload.id, ticketId);

    await refresh({ userId, agentId });

    return {
      success: true,
      agentId,
      status,
      userId,
    };
  } catch (e) {
    if (e instanceof UnloggingError)
      return { success: false, message: e.message };

    console.trace(e);

    return { success: false, message: "Internal server error." };
  }
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

async function getTicketInfo(ticketId: number) {
  const ticket = await db
    .select({
      agentId: TicketModel.agentId,
      status: TicketModel.status,
      userId: TicketModel.userId,
    })
    .from(TicketModel)
    .where(eq(TicketModel.id, ticketId))
    .then((r) => r.at(0));

  if (!ticket) throw new UnloggingError("Ticket not found.");

  return ticket;
}

async function refresh({
  userId,
  agentId,
}: {
  userId: number;
  agentId: number | null;
}) {
  pusher({
    page: "/tickets/my-tickets/refresh",
    to: `user-${userId}`,
  });
  pusher({
    page: "tickets/notification/count",
    to: `user-${userId}`,
  });

  if (agentId) {
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

async function updateSeenBy(userId: number, ticketId: number) {
  const unseenMessageIds: { id: number }[] = await db
    .select({
      id: TicketMessageModel.id,
    })
    .from(TicketMessageModel)
    .leftJoin(
      TicketMessageSeenByModel,
      and(
        eq(TicketMessageSeenByModel.messageId, TicketMessageModel.id),
        eq(TicketMessageSeenByModel.userId, userId),
      ),
    )
    .where(
      and(
        eq(TicketMessageModel.ticketId, ticketId),
        isNull(TicketMessageSeenByModel),
      ),
    );

  if (!unseenMessageIds.length) return;

  await db.insert(TicketMessageSeenByModel).values(
    unseenMessageIds.map((r) => ({
      messageId: r.id,
      userId,
    })),
  );
}
