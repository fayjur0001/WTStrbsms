import db from "@/db";
import { TicketModel } from "@/db/schema";
import Role from "@/types/role.type";
import { sql, and, or, eq, isNull } from "drizzle-orm";

export default async function getOpenedTicketCount(
  userId: number,
  role: Role,
): Promise<number> {
  return await db
    .select({ total: sql<number>`count(*)::int` })
    .from(TicketModel)
    .where(
      and(
        or(
          eq(TicketModel.agentId, userId),
          eq(TicketModel.userId, userId),
          ["admin", "super admin", "support"].includes(role)
            ? isNull(TicketModel.agentId)
            : undefined,
        ),
        eq(TicketModel.status, "opened"),
      ),
    )
    .then((r) => r.at(0)?.total || 0);
}
