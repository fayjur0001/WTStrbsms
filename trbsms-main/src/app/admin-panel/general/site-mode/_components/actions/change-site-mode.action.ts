"use server";

import getAuth from "@/lib/utils/auth";
import SiteOptions from "@/lib/utils/site-options";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import { z } from "zod";

const modes = ["production", "maintenance"] as const;

export default async function changeSiteModeAction(
  data: unknown,
): Promise<ResponseWraper<unknown>> {
  try {
    await validateUser();
    const mode = parse(data);
    await changeSiteMode(mode);

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
    return z.enum(modes).parse(data);
  } catch {
    throw new UnloggingError("Bad request.");
  }
}

async function changeSiteMode(mode: string) {
  await SiteOptions.siteMode.set(mode);
}
