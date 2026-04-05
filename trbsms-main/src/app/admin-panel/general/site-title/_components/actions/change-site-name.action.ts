"use server";

import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import schema from "../schemas/site-name.schema";
import SiteOptions from "@/lib/utils/site-options";
import pusher from "@/lib/utils/pusher";

export default async function changeSiteNameAction(
  data: unknown,
): Promise<ResponseWraper<unknown>> {
  try {
    await validateUser();

    const { siteName } = parseData(data);

    await changeSiteName(siteName);

    await refresh();

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

function parseData(data: unknown) {
  try {
    return schema.parse(data);
  } catch {
    throw new UnloggingError("Invalid request.");
  }
}

async function changeSiteName(siteName: string) {
  await SiteOptions.siteName.set(siteName);
}

async function refresh() {
  await pusher({ page: "/header/site-name", to: "logged-in" });
}
