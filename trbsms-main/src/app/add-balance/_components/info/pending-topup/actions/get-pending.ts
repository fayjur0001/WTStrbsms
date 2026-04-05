import db from "@/db";
import { AddedFundModel } from "@/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";

export default async function getPending(userId: number): Promise<number> {
  return db
    .select({ total: sql<number>`SUM(${AddedFundModel.amount})::real` })
    .from(AddedFundModel)
    .where(
      and(
        eq(AddedFundModel.userId, userId),
        eq(AddedFundModel.status, "pending"),
        gte(
          AddedFundModel.createdAt,
          new Date(new Date().getTime() - 48 * 60 * 60 * 1000),
        ),
      ),
    )
    .then((r) => r.at(0)?.total || 0);
}
