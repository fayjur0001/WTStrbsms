"use server";

import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import getSchema from "../schemas/new-ticket.schema";
import { z } from "zod";
import Role from "@/types/role.type";
import db from "@/db";
import {
  TicketMessageModel,
  TicketMessageSeenByModel,
  TicketModel,
} from "@/db/schema";
import pusher from "@/lib/utils/pusher";

export default async function createTicketAction(
  uData: unknown,
): Promise<ResponseWraper<unknown>> {
  try {
    const auth = getAuth();
    await validateUser(auth);

    const payload = await auth.getPayload();

    const data = await parseData(payload.role, uData);

    const { agentId, userId } = await createTicket({
      data,
      role: payload.role,
      userId: payload.id,
    });

    await refresh(agentId, userId);

    return { success: true };
  } catch (e) {
    if (e instanceof UnloggingError) {
      return { success: false, message: e.message };
    }

    console.trace(e);
    return { success: false, message: "Internal server error." };
  }
}

async function validateUser(auth: ReturnType<typeof getAuth>) {
  if (!(await auth.verify([]))) {
    throw new UnloggingError("Unauthorized");
  }
}

async function parseData(role: Role, data: unknown) {
  try {
    const schema = getSchema(role);
    return await schema.parseAsync(data);
  } catch {
    throw new UnloggingError("Invalid request.");
  }
}

async function createTicket({
  role,
  userId,
  data,
}: {
  userId: number;
  role: Role;
  data: z.infer<ReturnType<typeof getSchema>>;
}): Promise<{ agentId: number | null; userId: number }> {
  const messageUserId = userId;
  const agentId = ["admin", "super admin"].includes(role) ? userId : null;
  // @ts-expect-error aaa
  userId = ["admin", "super admin"].includes(role) ? data.userId : userId;

  const ticketId: number | undefined = await db
    .insert(TicketModel)
    .values({
      subject: data.subject,
      userId,
      agentId,
    })
    .returning({ id: TicketModel.id })
    .then((r) => r.at(0)?.id);

  if (!ticketId) {
    throw new UnloggingError("Ticket not created.");
  }

  const messageId: number | undefined = await db
    .insert(TicketMessageModel)
    .values({
      ticketId,
      userId: messageUserId,
      message: data.description,
    })
    .returning({ id: TicketMessageModel.id })
    .then((r) => r.at(0)?.id);

  if (!messageId) {
    throw new UnloggingError("Message not created.");
  }

  await db.insert(TicketMessageSeenByModel).values({
    messageId,
    userId: messageUserId,
  });

  return { agentId, userId };
}

async function refresh(agentId: number | null, userId: number) {
  await pusher({
    page: "/tickets/my-tickets/refresh",
    to: `user-${userId}`,
  });
  await pusher({
    page: "tickets/notification/count",
    to: `user-${userId}`,
  });

  if (agentId) {
    await pusher({
      page: "/tickets/my-tickets/refresh",
      to: `user-${agentId}`,
    });
    await pusher({
      page: "tickets/notification/count",
      to: `user-${agentId}`,
    });
  } else
    await pusher({
      page: "/tickets/unclaimed-tickets/refresh",
      to: "staff",
    });
}
