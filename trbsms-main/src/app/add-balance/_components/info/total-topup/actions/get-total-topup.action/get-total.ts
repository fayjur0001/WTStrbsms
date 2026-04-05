import db from "@/db";
import { AddedFundModel } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";

export default async function getTotal(userId: number): Promise<number> {
  return await db
    .select({ total: sql<number>`SUM(${AddedFundModel.amount})::real` })
    .from(AddedFundModel)
    .where(
      and(
        eq(AddedFundModel.userId, userId),
        eq(AddedFundModel.status, "approved"),
      ),
    )
    .then((r) => r.at(0)?.total || 0);
}
