"use server";

import getAuth from "@/lib/utils/auth";
import SiteOptions from "@/lib/utils/site-options";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";

export default async function getSiteNameAction(): Promise<
  ResponseWraper<{ siteName: string }>
> {
  try {
    await validateUser();
    const siteName = await getSiteName();

    return {
      success: true,
      siteName,
    };
  } catch (e) {
    if (e instanceof UnloggingError)
      return { success: false, message: e.message };

    console.trace(e);
    return { success: false, message: "Internal server error." };
  }
}

async function validateUser() {
  const auth = getAuth();

  if (!(await auth.verify([]))) throw new UnloggingError("Unauthorized.");
}

async function getSiteName() {
  return SiteOptions.siteName.get();
}
