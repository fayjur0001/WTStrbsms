import db from "@/db";
import nowPaymentsApiUrl from "@/lib/utils/now-payments-api-url";
import paymentExpireTime from "@/lib/utils/payment-expire-time";
import SiteOptions from "@/lib/utils/site-options";

export default async function getCryptos(userId: number): Promise<string[]> {
  const url = `${nowPaymentsApiUrl}/merchant/coins`;

  const apiKey = await SiteOptions.payment.apiKey.get();

  const res: { selectedCurrencies: string[] } = await fetch(url, {
    headers: {
      "x-api-key": apiKey,
    },
  }).then((r) => r.json());

  const pendingFunds = await db.query.AddedFundModel.findMany({
    columns: { currency: true },
    where: (model, { eq, and, gte }) =>
      and(
        eq(model.status, "pending"),
        gte(
          model.createdAt,
          new Date(new Date().getTime() - paymentExpireTime),
        ),
        eq(model.userId, userId),
        eq(model.method, "now_payments"),
      ),
  });

  return res.selectedCurrencies.filter(
    (c) => !pendingFunds.some((f) => f.currency === c),
  );
}
