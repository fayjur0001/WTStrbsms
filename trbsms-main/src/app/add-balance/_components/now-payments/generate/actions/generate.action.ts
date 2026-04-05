"use server";

import getAuth from "@/lib/utils/auth";
import serverAction from "@/lib/utils/server-action";
import UnloggingError from "@/lib/utils/unlogging-error";
import { z } from "zod";
import getSchema from "../schemas/generate.schema";
import getCryptos from "./commons/get-cryptos";
import nowPaymentsApiUrl from "@/lib/utils/now-payments-api-url";
import SiteOptions from "@/lib/utils/site-options";
import db from "@/db";
import { AddedFundModel } from "@/db/schema";
import pusher from "@/lib/utils/pusher";
import { revalidatePath } from "next/cache";

export default async function generateAction(data: unknown) {
  return serverAction(async () => {
    const payload = await validateUser();

    const { crypto, amount } = await parse(data, payload.id);

    await generate({ crypto, amount, userId: payload.id });

    await refresh(payload.id);
  });
}

async function validateUser() {
  const auth = getAuth();

  if (!(await auth.verify([]))) throw new UnloggingError("Unauthorized.");

  return auth.getPayload();
}

async function parse(
  data: unknown,
  userId: number,
): Promise<z.infer<ReturnType<typeof getSchema>>> {
  try {
    const cryptos = await getCryptos(userId);

    const schema = getSchema(cryptos as [string, ...string[]]);

    return schema.parseAsync(data);
  } catch (e) {
    console.trace(e);
    throw new UnloggingError("Bad request.");
  }
}

async function generate({
  crypto,
  amount,
  userId,
}: {
  crypto: string;
  amount: number;
  userId: number;
}) {
  const url = `${nowPaymentsApiUrl}/payment`;

  const apiKey = await SiteOptions.payment.apiKey.get();

  const hostUrl = await SiteOptions.hostUrl.get();

  const secret = await SiteOptions.payment.callbackSecret.get();

  const callback = new URL(`${hostUrl}/add-balance/callback`);
  callback.searchParams.append("secret", secret);
  callback.searchParams.append("method", "now-payments");

  const data = {
    price_amount: calculateAmount(amount),
    price_currency: "usd",
    pay_currency: crypto,
    ipn_callback_url: callback,
    ...(process.env.NODE_ENV === "development"
      ? { case: "partially_paid" }
      : {}),
    payout_currency: crypto,
  };

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then((r) => r.json());

  await db.insert(AddedFundModel).values({
    amount,
    userId,
    walletAddress: res.pay_address,
    currency: crypto,
    method: "now_payments",
  });
}

function calculateAmount(amount: number): number {
  return (10 / 100) * amount + amount;
}

async function refresh(userId: number) {
  revalidatePath("/add-balance");
  await pusher({
    page: "/add-balance/now-payments/generate",
    to: `user-${userId}`,
  });
  await pusher({
    page: "/add-balance/history",
    to: `user-${userId}`,
  });
  await pusher({
    page: "/admin-panel/transactions",
    to: "admin",
  });
  await pusher({
    page: "/add-balance/last-fund",
    to: `user-${userId}`,
  });
  await pusher({
    page: "/add-balance/pending",
    to: `user-${userId}`,
  });
}
