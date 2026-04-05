"use server";

import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import getCount from "./get-count";

export default async function getNotificationCountAction(): Promise<
  ResponseWraper<{ count: number }>
> {
  try {
    const auth = getAuth();

    if (!(await auth.verify([])))
      return {
        success: true,
        count: 0,
      };

    const payload = await auth.getPayload();

    const count = await getCount(payload.id, payload.role);

    return {
      success: true,
      count,
    };
  } catch (e) {
    if (e instanceof UnloggingError)
      return { success: false, message: e.message };

    console.trace(e);
    return {
      success: false,
      message: "Internal server error.",
    };
  }
}
