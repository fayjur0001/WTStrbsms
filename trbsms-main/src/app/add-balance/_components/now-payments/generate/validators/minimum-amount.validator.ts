"use server";

import getAuth from "@/lib/utils/auth";
import nowPaymentsApiUrl from "@/lib/utils/now-payments-api-url";
import SiteOptions from "@/lib/utils/site-options";

export default async function minimumAmountValidator(
  amount: number,
  crypto: string,
): Promise<string | void> {
  try {
    const auth = getAuth();

    if (!(await auth.verify([]))) return "Unauthorized.";

    const apiKey = await SiteOptions.payment.apiKey.get();
    const estimatedResponse: { estimated_amount: number } = await fetch(
      `${nowPaymentsApiUrl}/estimate?amount=${amount}&currency_from=USD&currency_to=${crypto}&is_fixed_rate=False&is_fee_paid_by_user=False`,
      {
        headers: {
          "x-api-key": apiKey,
        },
      },
    ).then((r) => r.json());

    const minAmountResponse: { min_amount: number } = await fetch(
      `${nowPaymentsApiUrl}/min-amount?currency_from=${crypto}`,
      {
        headers: {
          "x-api-key": apiKey,
        },
      },
    ).then((r) => r.json());

    if (estimatedResponse.estimated_amount < minAmountResponse.min_amount)
      return `Amount must be greater than ${Math.ceil((amount / estimatedResponse.estimated_amount) * minAmountResponse.min_amount)} $`;
  } catch (error) {
    console.trace(error);
    return "Something went wrong.";
  }
}
