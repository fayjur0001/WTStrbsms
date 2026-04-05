"use server";

import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import schema from "../schemas/send-text.schema";
import db from "@/db";
import { and, eq, or } from "drizzle-orm";
import {
  TicketMessageModel,
  TicketMessageSeenByModel,
  TicketModel,
} from "@/db/schema";
import pusher from "@/lib/utils/pusher";

export default async function sendTextAction(
  uData: unknown,
): Promise<ResponseWraper<unknown>> {
  try {
    const auth = getAuth();

    await validateUser(auth);

    const { ticketId, text } = await parseData(uData);

    const payload = await auth.getPayload();

    await sendText({ ticketId, text, userId: payload.id });

    await refresh({ ticketId });

    return { success: true };
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

async function parseData(uData: unknown) {
  try {
    return await schema.parseAsync(uData);
  } catch {
    throw new UnloggingError("Invalid request.");
  }
}

async function sendText({
  ticketId,
  text,
  userId,
}: {
  ticketId: number;
  text: string;
  userId: number;
}) {
  const ticket: { id: number } | undefined = await db
    .select({ id: TicketModel.id })
    .from(TicketModel)
    .where(
      and(
        eq(TicketModel.id, ticketId),
        or(eq(TicketModel.userId, userId), eq(TicketModel.agentId, userId)),
      ),
    )
    .then((r) => r.at(0));

  if (!ticket) throw new UnloggingError("Ticket not found.");

  const messageId: number | undefined = await db
    .insert(TicketMessageModel)
    .values({
      ticketId: ticket.id,
      userId,
      message: text,
    })
    .returning({ id: TicketMessageModel.id })
    .then((r) => r.at(0)?.id);

  if (!messageId) throw new UnloggingError("Failed to send message.");

  await db.insert(TicketMessageSeenByModel).values({
    messageId,
    userId,
  });
}

async function refresh({ ticketId }: { ticketId: number }) {
  const ticket: { userId: number; agentId: number | null } | undefined =
    await db.query.TicketModel.findFirst({
      where: (model, { eq }) => eq(model.id, ticketId),
      columns: { userId: true, agentId: true },
    });

  if (!ticket) throw new UnloggingError("Ticket not found.");

  await pusher({
    page: `/tickets/chat/messages/${ticketId}/refresh`,
    to: `user-${ticket.userId}`,
  });
  await pusher({
    page: "/tickets/my-tickets/refresh",
    to: `user-${ticket.userId}`,
  });
  await pusher({
    page: "tickets/notification/count",
    to: `user-${ticket.userId}`,
  });

  if (ticket.agentId) {
    await pusher({
      page: `/tickets/chat/messages/${ticketId}/refresh`,
      to: `user-${ticket.agentId}`,
    });
    await pusher({
      page: "/tickets/my-tickets/refresh",
      to: `user-${ticket.agentId}`,
    });
    await pusher({
      page: "tickets/notification/count",
      to: `user-${ticket.agentId}`,
    });
  }
}
