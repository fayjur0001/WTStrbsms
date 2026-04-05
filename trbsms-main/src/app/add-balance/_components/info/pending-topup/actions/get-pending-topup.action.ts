"use server";

import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import validateUser from "./validate-user";
import getPending from "./get-pending";

export default async function getPendingTopupAction(): Promise<
  ResponseWraper<{ pending: number }>
> {
  try {
    const auth = getAuth();

    await validateUser(auth);

    const payload = await auth.getPayload();

    const pending = await getPending(payload.id);

    return { success: true, pending };
  } catch (e) {
    if (e instanceof UnloggingError)
      return { success: false, message: e.message };

    console.trace(e);
    return { success: false, message: "Internal server error." };
  }
}
