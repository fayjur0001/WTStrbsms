"use server";

import db from "@/db";
import { AddedFundModel } from "@/db/schema";
import getAuth from "@/lib/utils/auth";
import paymentExpireTime from "@/lib/utils/payment-expire-time";
import UnloggingError from "@/lib/utils/unlogging-error";
import Payload from "@/types/payload.type";
import ResponseWraper from "@/types/response-wraper.type";
import { and, count, desc, eq, gte, inArray, or } from "drizzle-orm";
import { z } from "zod";

export type Transaction = {
  id: number;
  txId: string | null;
  walletName: string;
  walletAddress: string;
  creationDate: Date;
  amount: number;
  status: "pending" | "approved" | "rejected";
};

export default async function getAllTransactionsAction(
  uData: unknown,
): Promise<ResponseWraper<{ transactions: Transaction[]; totalPage: number }>> {
  try {
    const auth = getAuth();

    await validateUser(auth);
    const data = parseData(uData);

    const payload = await auth.getPayload();

    const { transactions, totalPage } = await getTransactions(payload, data);

    return {
      success: true,
      transactions,
      totalPage,
    };
  } catch (e) {
    if (e instanceof UnloggingError) {
      return {
        success: false,
        message: e.message,
      };
    }

    console.trace(e);

    return {
      success: false,
      message: "Internal Server Error.",
    };
  }
}

async function getTransactions(
  payload: Payload,
  data: ReturnType<typeof parseData>,
): Promise<{ transactions: Transaction[]; totalPage: number }> {
  const query = db
    .select({
      id: AddedFundModel.id,
      txId: AddedFundModel.txid,
      walletName: AddedFundModel.currency,
      walletAddress: AddedFundModel.walletAddress,
      creationDate: AddedFundModel.createdAt,
      amount: AddedFundModel.amount,
      status: AddedFundModel.status,
    })
    .from(AddedFundModel)
    .where(
      and(
        eq(AddedFundModel.userId, payload.id),
        or(
          and(
            eq(AddedFundModel.status, "pending"),
            gte(
              AddedFundModel.createdAt,
              new Date(new Date().getTime() - paymentExpireTime),
            ),
          ),
          inArray(AddedFundModel.status, ["approved", "rejected"]),
        ),
      ),
    )
    .as("query");

  const limit = data.limit;

  const offset = (data.page - 1) * limit;

  const [transactions, totalPage] = await Promise.all([
    db
      .select()
      .from(query)
      .orderBy(desc(query.creationDate))
      .limit(limit)
      .offset(offset),
    db
      .select({
        total: count(query.id),
      })
      .from(query)
      .then((row) => Math.ceil((row.at(0)?.total || 0) / limit) || 0),
  ]);
  return { transactions, totalPage };
}

async function validateUser(auth: ReturnType<typeof getAuth>) {
  if (!(await auth.verify([]))) {
    throw new UnloggingError("Unauthorized");
  }
}

const schema = z.object({
  page: z.number().optional().default(1),
  limit: z.number().optional().default(20),
});

function parseData(data: unknown): z.infer<typeof schema> {
  return schema.parse(data);
}
