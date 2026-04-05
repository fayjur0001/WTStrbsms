import UnloggingError from "@/lib/utils/unlogging-error";
import { z } from "zod";
import SiteOptions from "@/lib/utils/site-options";
import db from "@/db";
import { AddedFundModel, addedFundStatusEnum } from "@/db/schema";
import { eq } from "drizzle-orm";
import pusher from "@/lib/utils/pusher";
import nowPaymentsApiUrl from "@/lib/utils/now-payments-api-url";

export async function POST(req: Request) {
  try {
    console.log("trying to verify now payments transaction.");

    const paramSchema = z.object({
      secret: z.string().min(1),
      method: z.literal("now-payments"),
    });

    const url = new URL(req.url);

    let paramData: z.infer<typeof paramSchema>;

    try {
      paramData = paramSchema.parse({
        secret: url.searchParams.get("secret"),
        method: url.searchParams.get("method"),
      });
    } catch {
      throw new UnloggingError("Bad request.");
    }

    const nowPaymentsSecret = await SiteOptions.payment.callbackSecret.get();

    if (!nowPaymentsSecret) throw new UnloggingError("Where the admin at?");

    if (paramData.secret !== nowPaymentsSecret)
      throw new UnloggingError(
        "Nice try. We are willing to hire you. Contact us. Seriously?",
      );

    const nowPaymentsApiKey = await SiteOptions.payment.apiKey.get();

    if (!nowPaymentsApiKey) {
      throw new UnloggingError("Where the admin at?");
    }

    const bodySchema = z.object({
      payment_id: z.number().min(1),
    });

    let bodyData: z.infer<typeof bodySchema>;

    try {
      bodyData = bodySchema.parse(await req.json());
    } catch {
      throw new UnloggingError("Bad request.");
    }

    const transactionResponse: Partial<{
      payment_status: string;
      pay_address: string;
      payin_hash: string;
      outcome_amount: number;
      outcome_currency: string;
    }> = await fetch(`${nowPaymentsApiUrl}/payment/${bodyData.payment_id}`, {
      headers: {
        "x-api-key": nowPaymentsApiKey,
      },
    }).then((r) => r.json());

    if (
      !transactionResponse.payment_status ||
      !transactionResponse.pay_address ||
      !transactionResponse.outcome_amount ||
      !transactionResponse.outcome_currency
    )
      throw new UnloggingError("Bad request.");

    async function convert(amount: number, currency: string): Promise<number> {
      const apiKey = await SiteOptions.payment.apiKey.get();

      const estimatedResponse: { estimated_amount: number } = await fetch(
        `${nowPaymentsApiUrl}/estimate?amount=${amount}&currency_from=${currency}&currency_to=usd&is_fixed_rate=False&is_fee_paid_by_user=False`,
        {
          headers: {
            "x-api-key": apiKey,
          },
        },
      ).then((r) => r.json());

      return estimatedResponse.estimated_amount;
    }

    const txid = transactionResponse.payin_hash;
    const amount = await convert(
      transactionResponse.outcome_amount,
      transactionResponse.outcome_currency,
    );

    let status: (typeof AddedFundModel.status.enumValues)[number] = "pending";

    switch (transactionResponse.payment_status) {
      case "finished":
      case "partially_paid":
        status = "approved";
        break;
      case "confirmed":
        status = "pending";
        break;
      default:
        status = "pending";
        break;
    }

    const addFund = await getAddedFund(
      transactionResponse.pay_address,
      "now_payments",
    );

    await updateFund({ status, txid, value: amount, id: addFund.id });

    await refresh(addFund.userId);

    return Response.json({ success: true });
  } catch (e) {
    if (e instanceof UnloggingError)
      return Response.json({ success: false, message: e.message });

    console.trace(e);
    return Response.json({ success: false, message: "Internal server error." });
  }
}

async function getAddedFund(
  address: string,
  method: (typeof AddedFundModel.method.enumValues)[number],
): Promise<{
  id: number;
  status: (typeof addedFundStatusEnum.enumValues)[number];
  userId: number;
}> {
  const addedFund: Awaited<ReturnType<typeof getAddedFund>> | undefined =
    await db.query.AddedFundModel.findFirst({
      where: (model, { eq, and }) =>
        and(eq(model.walletAddress, address), eq(model.method, method)),
      columns: { id: true, status: true, userId: true },
    });

  if (!addedFund) {
    throw new UnloggingError("Invalid request.");
  }

  return addedFund;
}

async function updateFund({
  id,
  value,
  status,
  txid,
}: {
  id: number;
  value: number;
  status: (typeof addedFundStatusEnum.enumValues)[number];
  txid?: string;
}) {
  await db
    .update(AddedFundModel)
    .set({ amount: value, status, txid })
    .where(eq(AddedFundModel.id, id));
}

async function refresh(userId: number) {
  await pusher({ page: "/admin-panel/transactions", to: "admin" });
  await pusher({ page: "/header/balance", to: `user-${userId}` });
  await pusher({ page: "/add-balance/history", to: `user-${userId}` });
  await pusher({ page: "/add-balance/total-topup", to: `user-${userId}` });
  await pusher({ page: "/add-balance/pending", to: `user-${userId}` });
  await pusher({ page: "/add-balance/last-fund", to: `user-${userId}` });
}
