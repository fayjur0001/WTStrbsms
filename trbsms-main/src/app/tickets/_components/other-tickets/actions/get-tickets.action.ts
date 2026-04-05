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
import { and, desc, eq, isNotNull, ne, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { z } from "zod";

type Ticket = {
  id: number;
  subject: string;
  username: string;
  agentname: string;
  totalMessage: number;
  totalReadMessage: number;
  status: (typeof TicketModel.status.enumValues)[number];
};

export default async function getTicketsAction(
  data: unknown,
): Promise<ResponseWraper<{ tickets: Ticket[]; totalPages: number }>> {
  try {
    const auth = getAuth();
    await validateUser(auth);
    const { limit, page } = parse(data);
    const payload = await auth.getPayload();
    const { tickets, totalPages } = await getTickets({
      limit,
      page,
      userId: payload.id,
    });

    return { success: true, tickets, totalPages };
  } catch (e) {
    if (e instanceof UnloggingError)
      return { success: false, message: e.message };

    console.trace(e);
    return { success: false, message: "Internal server error." };
  }
}

async function validateUser(auth: ReturnType<typeof getAuth>) {
  if (!(await auth.verify(["super admin"])))
    throw new UnloggingError("Unauthorized.");
}

function parse(data: unknown) {
  try {
    return z
      .object({
        limit: z.coerce.number().min(1).optional().default(20),
        page: z.coerce.number().min(1).optional().default(1),
      })
      .parse(data);
  } catch {
    throw new UnloggingError("Bad request.");
  }
}

async function getTickets({
  userId,
  limit,
  page,
}: {
  limit: number;
  page: number;
  userId: number;
}): Promise<{ tickets: Ticket[]; totalPages: number }> {
  const usersQuery = alias(UserModel, "users");
  const agentsQuery = alias(UserModel, "agents");

  const query = db
    .select({
      id: TicketModel.id,
      date: TicketModel.createdAt,
      subject: TicketModel.subject,
      username: sql<string>`${usersQuery.username}`.as("username"),
      agentname: sql<string>`${agentsQuery.username}`.as("agentname"),
      totalMessage: sql<number>`count(${TicketMessageModel.id})::int`.as(
        "totalMessage",
      ),
      totalReadMessage:
        sql<number>`count(${TicketMessageSeenByModel.id})::int`.as(
          "totalReadMessage",
        ),
      status: TicketModel.status,
    })
    .from(TicketModel)
    .where(and(isNotNull(TicketModel.agentId), ne(TicketModel.agentId, userId)))
    .leftJoin(
      TicketMessageModel,
      eq(TicketMessageModel.ticketId, TicketModel.id),
    )
    .leftJoin(
      TicketMessageSeenByModel,
      and(
        eq(TicketMessageSeenByModel.messageId, TicketMessageModel.id),
        eq(TicketMessageSeenByModel.userId, userId),
      ),
    )
    .innerJoin(usersQuery, eq(usersQuery.id, TicketModel.userId))
    .innerJoin(agentsQuery, eq(agentsQuery.id, TicketModel.agentId))
    .groupBy(TicketModel.id, usersQuery.id, agentsQuery.id)
    .as("query");

  const [tickets, totalPages] = await Promise.all([
    db
      .select()
      .from(query)
      .limit(limit)
      .offset((page - 1) * limit)
      .orderBy(desc(query.date)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(query)
      .then((r) => Math.ceil((r.at(0)?.count || 0) / limit)),
  ]);

  return { tickets, totalPages };
}
