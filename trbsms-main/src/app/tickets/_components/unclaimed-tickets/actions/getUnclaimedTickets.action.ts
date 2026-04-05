"use server";

import db from "@/db";
import { TicketMessageModel, TicketModel, UserModel } from "@/db/schema";
import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import { and, desc, eq, isNull, ne, sql } from "drizzle-orm";
import { z } from "zod";

export type Ticket = {
  id: number;
  date: Date;
  subject: string;
  username: string;
  totalMessages: number;
};

export default async function getUnclaimedTickets(
  data: unknown,
): Promise<ResponseWraper<{ tickets: Ticket[]; totalPages: number }>> {
  try {
    const auth = getAuth();
    await validateUser(auth);

    const { page, limit } = parseData(data);

    const payload = await auth.getPayload();

    const { tickets, totalPages } = await getTickets({
      page,
      limit,
      userId: payload.id,
    });

    return {
      success: true,
      tickets,
      totalPages,
    };
  } catch (e) {
    if (e instanceof UnloggingError)
      return { success: false, message: e.message };

    console.trace(e);

    return {
      success: false,
      message: "Internal server error.",
    };
  }
}

async function getTickets({
  page,
  limit,
  userId,
}: {
  page: number;
  limit: number;
  userId: number;
}): Promise<{
  tickets: Ticket[];
  totalPages: number;
}> {
  const ticketsQuery = db
    .select({
      id: TicketModel.id,
      date: TicketModel.createdAt,
      subject: TicketModel.subject,
      username: UserModel.username,
      totalMessages: sql<number>`COUNT(${TicketMessageModel.id})`.as(
        "totalMessages",
      ),
    })
    .from(TicketModel)
    .leftJoin(
      TicketMessageModel,
      eq(TicketMessageModel.ticketId, TicketModel.id),
    )
    .innerJoin(UserModel, eq(UserModel.id, TicketModel.userId))
    .groupBy(TicketModel.id, UserModel.id)
    .where(and(isNull(TicketModel.agentId), ne(TicketModel.userId, userId)))
    .as("tickets");

  const offset = (page - 1) * limit;

  const [tickets, totalPages] = await Promise.all([
    db
      .select()
      .from(ticketsQuery)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(ticketsQuery.date)),
    db
      .select({ total: sql<number>`COUNT(*)` })
      .from(ticketsQuery)
      .then((r) => Math.ceil((r.at(0)?.total || 0) / limit)),
  ]);

  return { tickets, totalPages };
}

async function validateUser(auth: ReturnType<typeof getAuth>) {
  if (!(await auth.verify(["super admin", "admin", "support"])))
    throw new UnloggingError("Unauthorized.");
}
function parseData(data: unknown) {
  try {
    return z
      .object({
        page: z.coerce.number().min(1).optional().default(1),
        limit: z.coerce.number().min(1).optional().default(20),
      })
      .parse(data);
  } catch {
    throw new UnloggingError("Invalid request.");
  }
}
