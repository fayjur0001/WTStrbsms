"use server";

import getAuth from "@/lib/utils/auth";
import getBalance from "@/lib/utils/get-balance";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";

export default async function getBalanceAction(): Promise<
  ResponseWraper<{
    balance: number;
  }>
> {
  try {
    const auth = getAuth();

    await validateUser(auth);

    const payload = await auth.getPayload();

    const balance = await getBalance(payload.id);

    return {
      success: true,
      balance,
    };
  } catch (e) {
    if (e instanceof UnloggingError)
      return { success: false, message: e.message };

    console.trace(e);
    return { success: false, message: "Internal server error." };
  }
}

async function validateUser(auth: ReturnType<typeof getAuth>) {
  if (!(await auth.verify([]))) throw new UnloggingError("Unauthorized.");
}
