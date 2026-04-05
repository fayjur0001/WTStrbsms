"use server";

import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import validateUser from "./validate-user";
import getTotal from "./get-total";

export default async function getTotalTopupAction(): Promise<
  ResponseWraper<{ total: number }>
> {
  try {
    const auth = getAuth();

    await validateUser(auth);

    const payload = await auth.getPayload();

    const total = await getTotal(payload.id);

    return { success: true, total };
  } catch (e) {
    if (e instanceof UnloggingError)
      return { success: false, message: e.message };

    console.trace(e);
    return { success: false, message: "Internal server error." };
  }
}
