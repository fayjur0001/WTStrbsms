"use server";

import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import schema from "../schemas/notice.schema";
import SiteOptions from "@/lib/utils/site-options";

export default async function saveNoticeAction(
  data: unknown,
): Promise<ResponseWraper<unknown>> {
  try {
    await validateUser();
    const { notice } = parse(data);
    await saveNotice(notice);

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
  if (!(await auth.verify(["admin", "super admin"])))
    throw new UnloggingError("Unauthorized.");
}

function parse(data: unknown) {
  try {
    return schema.parse(data);
  } catch {
    throw new UnloggingError("Bad request.");
  }
}

async function saveNotice(notice: string) {
  await SiteOptions.notice.set(notice);
}
