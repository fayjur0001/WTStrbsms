"use server";

import getAuth from "@/lib/utils/auth";
import pusher from "@/lib/utils/pusher";
import serverAction from "@/lib/utils/server-action";
import SiteOptions from "@/lib/utils/site-options";
import UnloggingError from "@/lib/utils/unlogging-error";
import schema from "../schemas/edit.schema";

export default async function editAction(data: unknown) {
  return serverAction(async () => {
    await validateUser();
    const { hostUrl } = parse(data);

    await SiteOptions.hostUrl.set(hostUrl);

    await pusher({
      page: "admin-panel/api-settings/payment/get-configs",
      to: "admin",
    });
  });
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
