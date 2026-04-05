"use server";

import serverAction from "@/lib/utils/server-action";
import SiteOptions from "@/lib/utils/site-options";
import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";

type Entry = {
  label: string;
  value: string;
  copy?: boolean;
};

export default async function getConfigsAction() {
  return serverAction<{
    payments: Entry[];
    hostUrl: string;
  }>(async () => {
    await validateUser();

    const nowPaymentsCallbackSecret =
      await SiteOptions.payment.callbackSecret.get();

    return {
      payments: [
        {
          label: "Callback Secret",
          value: nowPaymentsCallbackSecret,
        },
        {
          label: "Api Key",
          value: await SiteOptions.payment.apiKey.get(),
        },
        {
          label: "Callback URL",
          value: `${await SiteOptions.hostUrl.get()}/add-balance/callback?secret=${nowPaymentsCallbackSecret}&method=now-payments`,
          copy: true,
        },
      ],
      hostUrl: await SiteOptions.hostUrl.get(),
    };
  });
}

async function validateUser() {
  const auth = getAuth();

  if (!(await auth.verify(["admin", "super admin"])))
    throw new UnloggingError("Unauthorized.");
}
