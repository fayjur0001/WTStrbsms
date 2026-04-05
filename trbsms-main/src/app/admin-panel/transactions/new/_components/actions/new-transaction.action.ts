"use server";

import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import getSchema from "../schemas/get-new-transaction.schema";
import { AddedFundModel } from "@/db/schema";
import db from "@/db";
import pusher from "@/lib/utils/pusher";
import nowPaymentsApiUrl from "@/lib/utils/now-payments-api-url";
import SiteOptions from "@/lib/utils/site-options";

export default async function newTransactionAction(
  data: unknown,
): Promise<ResponseWraper<unknown>> {
  try {
    await validateUser();
    const parsedData = await parseData(data);

    await newTransaction(parsedData);

    await refresh(parsedData.userId);

    return { success: true };
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
  try {
    const url = `${nowPaymentsApiUrl}/merchant/coins`;

    const apiKey = await SiteOptions.payment.apiKey.get();

    const res: { selectedCurrencies: string[] } = await fetch(url, {
      headers: {
        "x-api-key": apiKey,
      },
    }).then((r) => r.json());
    const currencies: string[] = res.selectedCurrencies;
    const schema = getSchema(currencies as [string, ...string[]]);
    return await schema.parseAsync(data);
  } catch {
    throw new UnloggingError("Invalid request.");
  }
}

async function newTransaction(data: Awaited<ReturnType<typeof parseData>>) {
  await db.insert(AddedFundModel).values({
    ...data,
    manualyUploaded: true,
    status: "approved",
    currency: data.currency,
  });
}

async function refresh(userId: number) {
  await pusher({ page: `/admin-panel/transactions`, to: "admin" });
  await pusher({ page: "/header/balance", to: `user-${userId}` });
  await pusher({ page: "/add-balance/history", to: `user-${userId}` });
  await pusher({ page: "/add-balance/total-topup", to: `user-${userId}` });
}
