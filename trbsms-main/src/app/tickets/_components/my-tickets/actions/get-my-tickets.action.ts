"use server";

import db from "@/db";
import {
  TicketMessageModel,
  TicketMessageSeenByModel,
  TicketModel,
  UserModel,
} from "@/db/schema";
import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import { desc, eq, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { z } from "zod";

export type Ticket = {
  id: number;
  subject: string;
  username: string;
  readMessage: number;
  totalMessage: number;
  status: (typeof TicketModel.status.enumValues)[number];
};

export default async function getMyTicketsAction(
  uData: unknown,
): Promise<ResponseWraper<{ tickets: Ticket[]; totalPage: number }>> {
  try {
    const auth = getAuth();
    await validateUser(auth);

    const { page, limit } = parseDate(uData);

    const payload = await auth.getPayload();

    const { tickets, totalPage } = await getTickets({
      userId: payload.id,
      page,
      limit,
    });

    return {
      success: true,
      tickets,
      totalPage,
    };
  } catch (e) {
    if (e instanceof UnloggingError)
      return { success: false, message: e.message };

    console.trace(e);
    return { success: false, message: "Internal server error." };
  }
}

async function getTickets({
  userId,
  limit,
  page,
}: {
  userId: number;
  page: number;
  limit: number;
}): Promise<{ tickets: Ticket[]; totalPage: number }> {
  const seenByQuery = db
    .select({ messageId: TicketMessageSeenByModel.messageId })
    .from(TicketMessageSeenByModel)
    .where(eq(TicketMessageSeenByModel.userId, userId))
    .as("seen_by_query");

  const messagesQuery = db
    .select({
      ticketId: TicketMessageModel.ticketId,
      seen: sql<boolean>`${seenByQuery.messageId} IS NOT NULL`.as("seen"),
    })
    .from(TicketMessageModel)
    .leftJoin(seenByQuery, eq(seenByQuery.messageId, TicketMessageModel.id))
    .as("messages");

  const usersQuery = alias(UserModel, "users");
  const agentsQuery = alias(UserModel, "agents");

  const ticketsQuery = db
    .select({
      id: TicketModel.id,
      subject: TicketModel.subject,
      status: TicketModel.status,
      totalMessage: sql<number>`COUNT(${messagesQuery.ticketId})::int`.as(
        "totalMessage",
      ),
      readMessage:
        sql<number>`(COUNT(${messagesQuery.seen}) FILTER (WHERE ${messagesQuery.seen}))::int`.as(
          "readMessage",
        ),
      username: sql<string>`CASE 
        WHEN ${TicketModel.userId} = ${userId} 
        THEN ${agentsQuery.username}
        ELSE ${usersQuery.username}
      END`.as("uid"),
    })
    .from(TicketModel)
    .leftJoin(messagesQuery, eq(messagesQuery.ticketId, TicketModel.id))
    .leftJoin(usersQuery, eq(usersQuery.id, TicketModel.userId))
    .leftJoin(agentsQuery, eq(agentsQuery.id, TicketModel.agentId))
    .where(or(eq(TicketModel.userId, userId), eq(TicketModel.agentId, userId)))
    .groupBy(TicketModel.id, agentsQuery.id, usersQuery.id)
    .as("tickets");

  const offset = (page - 1) * limit;

  const [tickets, totalPage] = await Promise.all([
    db
      .select()
      .from(ticketsQuery)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(ticketsQuery.id)),
    db
      .select({ total: sql<number>`COUNT(${ticketsQuery.id})` })
      .from(ticketsQuery)
      .then((r) => Math.ceil((r.at(0)?.total || 0) / limit)),
  ]);

  return { tickets, totalPage };
}

async function validateUser(auth: ReturnType<typeof getAuth>) {
  if (!(await auth.verify([]))) throw new UnloggingError("Unauthorized");
}

function parseDate(data: unknown) {
  try {
    return z
      .object({
        page: z.coerce.number().default(1),
        limit: z.coerce.number().default(20),
      })
      .parse(data);
  } catch {
    throw new UnloggingError("Invalid request");
  }
}
