"use server";

import getAuth from "@/lib/utils/auth";
import nowPaymentsApiUrl from "@/lib/utils/now-payments-api-url";
import serverAction from "@/lib/utils/server-action";
import SiteOptions from "@/lib/utils/site-options";
import UnloggingError from "@/lib/utils/unlogging-error";
import { z } from "zod";

export default async function convertAction(data: unknown) {
  return serverAction<{ convertedAmount: number }>(async () => {
    await validateUser();
    const { amount, currency } = parse(data);
    const convertedAmount = await convert(amount, currency);

    return { convertedAmount };
  });
}

async function convert(amount: number, currency: string): Promise<number> {
  const apiKey = await SiteOptions.payment.apiKey.get();

  const estimatedResponse: { estimated_amount: number } = await fetch(
    `${nowPaymentsApiUrl}/estimate?amount=${(10 / 100) * amount + amount}&currency_from=USD&currency_to=${currency}&is_fixed_rate=False&is_fee_paid_by_user=False`,
    {
      headers: {
        "x-api-key": apiKey,
      },
    },
  ).then((r) => r.json());

  return estimatedResponse.estimated_amount;
}

async function validateUser() {
  const auth = getAuth();

  if (!(await auth.verify([]))) throw new UnloggingError("Unauthorized.");
}

function parse(data: unknown) {
  try {
    return z
      .object({
        amount: z.coerce.number().min(1),
        currency: z.string().min(1),
      })
      .parse(data);
  } catch {
    throw new UnloggingError("Bad request.");
  }
}
