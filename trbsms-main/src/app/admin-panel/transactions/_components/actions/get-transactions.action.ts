"use server";

import db from "@/db";
import { AddedFundModel, UserModel } from "@/db/schema";
import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import getFilterSchema from "../schemas/filter.schema";
import paymentExpireTime from "@/lib/utils/payment-expire-time";

export type Transaction = {
  id: number;
  walletAddress: string;
  txid: string | null;
  walletName: string;
  date: Date;
  username: string;
  amount: number;
  status: (typeof AddedFundModel.status.enumValues)[number];
};

export default async function getTransactionsAction(
  data: unknown,
): Promise<
  ResponseWraper<{ transactions: Transaction[]; totalPages: number }>
> {
  try {
    await validateUser();

    const { page, limit, filter } = await parseData(data);

    const { totalPages, transactions } = await getTransactions({
      page,
      limit,
      filter,
    });

    return { success: true, totalPages, transactions };
  } catch (e) {
    if (e instanceof UnloggingError)
      return { success: false, message: e.message };

    console.trace(e);
    return { success: false, message: "Internal server error." };
  }
}

async function validateUser() {
  const auth = getAuth();
  if (!(await auth.verify(["super admin"])))
    throw new UnloggingError("Unauthorized.");
}

async function parseData(data: unknown) {
  const currencies: string[] = await db
    .select({ currency: sql<string>`distinct currency` })
    .from(AddedFundModel)
    .then((res) => res.map((r) => r.currency));

  try {
    return z
      .object({
        limit: z.coerce.number().min(1).optional().default(20),
        page: z.coerce.number().min(1).optional().default(1),
        filter: getFilterSchema(["All", ...currencies]),
      })
      .parse(data);
  } catch {
    throw new UnloggingError("Invalid request.");
  }
}

async function getTransactions({
  filter,
  limit,
  page,
}: {
  page: number;
  limit: number;
  filter: z.infer<ReturnType<typeof getFilterSchema>>;
}): Promise<{ transactions: Transaction[]; totalPages: number }> {
  const transactionsQuery = db
    .select({
      id: AddedFundModel.id,
      date: AddedFundModel.createdAt,
      walletAddress: AddedFundModel.walletAddress,
      txid: AddedFundModel.txid,
      walletName: AddedFundModel.currency,
      username: UserModel.username,
      amount: AddedFundModel.amount,
      status: AddedFundModel.status,
    })
    .from(AddedFundModel)
    .innerJoin(UserModel, eq(AddedFundModel.userId, UserModel.id))
    .where(
      and(
        !filter.username
          ? undefined
          : sql`regexp_like(${UserModel.username}, ${filter.username}, 'i')`,
        filter.walletName === "All"
          ? undefined
          : eq(AddedFundModel.currency, filter.walletName),
        !filter.txid
          ? undefined
          : sql`regexp_like(${AddedFundModel.txid}, ${filter.txid}, 'i')`,
        sql`case 
          when ${AddedFundModel.status} = 'pending'
          then ${AddedFundModel.createdAt} + ${paymentExpireTime + " ms"}::interval > now()
          else true
        end`,
      ),
    )
    .as("transactions");

  const offset = (page - 1) * limit;

  const [transactions, totalPages] = await Promise.all([
    db
      .select()
      .from(transactionsQuery)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(transactionsQuery.date)),
    db
      .select({ total: sql<number>`count(*)` })
      .from(transactionsQuery)
      .then((r) => Math.ceil((r.at(0)?.total || 0) / limit)),
  ]);

  return { transactions, totalPages };
}
