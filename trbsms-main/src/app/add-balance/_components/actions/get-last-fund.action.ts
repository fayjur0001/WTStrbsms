"use server";

import db from "@/db";
import getAuth from "@/lib/utils/auth";
import paymentExpireTime from "@/lib/utils/payment-expire-time";
import serverAction from "@/lib/utils/server-action";
import UnloggingError from "@/lib/utils/unlogging-error";

type LastFund = {
  walletAddress: string;
  amount: number;
  currency: string;
};

export default async function getLastFundAction() {
  return serverAction<{ lastFund: LastFund | undefined }>(async () => {
    const payload = await validateUser();

    const lastFund = await getLastFund(payload.id);

    return { lastFund };
  });
}

async function getLastFund(userId: number) {
  return await db.query.AddedFundModel.findFirst({
    columns: {
      walletAddress: true,
      method: true,
      amount: true,
      currency: true,
    },
    where: (model, { eq, and, gte }) =>
      and(
        eq(model.status, "pending"),
        gte(
          model.createdAt,
          new Date(new Date().getTime() - paymentExpireTime),
        ),
        eq(model.userId, userId),
      ),
    orderBy: (model, { desc }) => desc(model.id),
  });
}

async function validateUser() {
  const auth = getAuth();

  if (!(await auth.verify([]))) throw new UnloggingError("Unauthenticated.");

  return auth.getPayload();
}
