import db from "@/db";
import {
  TicketModel,
  TicketMessageModel,
  TicketMessageSeenByModel,
} from "@/db/schema";
import { sql, eq, and, or, isNull } from "drizzle-orm";

export default async function getUnreadMessageCount(
  userId: number,
): Promise<number> {
  return await db
    .select({ total: sql<number>`count(*)::int` })
    .from(TicketModel)
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
    .where(
      and(
        or(eq(TicketModel.agentId, userId), eq(TicketModel.userId, userId)),
        isNull(TicketMessageSeenByModel.id),
        eq(TicketModel.status, "opened"),
      ),
    )
    .then((r) => r.at(0)?.total || 0);
}
