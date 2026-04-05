"use server";

import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import { z } from "zod";
import ticketIdExistsValidator from "../../validators/ticket-id-exists.validator";
import db from "@/db";
import { TicketMessageModel, TicketModel } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export type Message = {
  id: number;
  message: string;
  date: Date;
  right: boolean;
};

export default async function getMessagesAction(
  data: unknown,
): Promise<ResponseWraper<{ messages: Message[]; totalPages: number }>> {
  try {
    const auth = getAuth();

    await validateUser(auth);

    const { ticketId, page, limit } = await parseData(data);

    const payload = await auth.getPayload();

    const { messages, totalPages } = await getMessages({
      ticketId,
      page,
      limit,
      currentUserId: payload.id,
    });

    return { messages, success: true, totalPages };
  } catch (e) {
    if (e instanceof UnloggingError)
      return { success: false, message: e.message };

    console.trace(e);
    return { success: false, message: "Internal server error." };
  }
}

async function getMessages({
  ticketId,
  limit,
  page,
  currentUserId,
}: {
  ticketId: number;
  limit: number;
  page: number;
  currentUserId: number;
}): Promise<{ messages: Message[]; totalPages: number }> {
  const ticketInfo: { agentId: number | null; userId: number } | undefined =
    await db
      .select({ agentId: TicketModel.agentId, userId: TicketModel.userId })
      .from(TicketModel)
      .where(eq(TicketModel.id, ticketId))
      .then((r) => r.at(0));

  if (!ticketInfo) throw new UnloggingError("Ticket not found.");

  const { agentId, userId } = ticketInfo;

  const messagesQuery = db
    .select({
      id: TicketMessageModel.id,
      message: TicketMessageModel.message,
      date: TicketMessageModel.createdAt,
      right: sql<boolean>`CASE
            WHEN ${currentUserId}::int = ${agentId}::int OR ${currentUserId}::int = ${userId}::int
            THEN 
              CASE
                WHEN ${TicketMessageModel.userId} = ${currentUserId}::int
                THEN TRUE
                ELSE FALSE
              END
            ELSE ${TicketMessageModel.userId} = ${agentId}::int
          END`.as("right"),
    })
    .from(TicketMessageModel)
    .where(eq(TicketMessageModel.ticketId, ticketId))
    .as("messages");

  const offset = (page - 1) * limit;

  const [messages, totalPages] = await Promise.all([
    db
      .select()
      .from(messagesQuery)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(messagesQuery.date)),
    db
      .select({ total: sql<number>`count(*)` })
      .from(messagesQuery)
      .limit(1)
      .then((r) => Math.ceil((r.at(0)?.total || 0) / limit)),
  ]);

  return { messages, totalPages };
}

async function validateUser(auth: ReturnType<typeof getAuth>) {
  if (!(await auth.verify([]))) throw new UnloggingError("Unauthorized.");
}

async function parseData(data: unknown) {
  try {
    return await z
      .object({
        ticketId: z.coerce
          .number()
          .min(1)
          .superRefine(async (id, ctx) => {
            const message = await ticketIdExistsValidator(id);
            if (!!message) return ctx.addIssue({ message, code: "custom" });
          }),
        page: z.coerce.number().min(1).optional().default(1),
        limit: z.coerce.number().min(1).optional().default(20),
      })
      .parseAsync(data);
  } catch {
    throw new UnloggingError("Invalid request.");
  }
}
