"use server";

import getAuth from "@/lib/utils/auth";
import SiteOptions from "@/lib/utils/site-options";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";

export default async function getDefaultValuesAction(): Promise<
  ResponseWraper<{
    cut: {
      oneTime: number;
      longTerm: {
        short: number;
        regular: number;
        unlimited: number;
      };
      proxy: {
        shared: {
          day: number;
          week: number;
          month: number;
        };
        exclusive: {
          day: number;
          week: number;
          month: number;
        };
      };
      device: {
        day: number;
        week: number;
        month: number;
      };
    };
    user: string;
    apiKey: string;
    sharedProxyPrice: Awaited<
      ReturnType<(typeof SiteOptions)["sharedProxyPrice"]["get"]>
    >;
    exclusiveProxyPrice: Awaited<
      ReturnType<(typeof SiteOptions)["exclusiveProxyPrice"]["get"]>
    >;
    callbackSecret: string;
    devices: {
      login: string;
      password: string;
    };
  }>
> {
  try {
    await validateUser();

    const cut = await getCut();
    const user = await SiteOptions.apiUser.get();
    const apiKey = await SiteOptions.apiKey.get();
    const exclusiveProxyPrice = await SiteOptions.exclusiveProxyPrice.get();
    const sharedProxyPrice = await SiteOptions.sharedProxyPrice.get();
    const callbackSecret = await SiteOptions.providerCallbackSecret.get();
    const devices = {
      login: await SiteOptions.devices.login.get(),
      password: await SiteOptions.devices.password.get(),
    };

    return {
      success: true,
      cut,
      user,
      apiKey,
      exclusiveProxyPrice,
      sharedProxyPrice,
      callbackSecret,
      devices,
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

  if (!(await auth.verify(["super admin"])))
    throw new UnloggingError("Unauthorized.");
}

async function getCut(): Promise<{
  oneTime: number;
  longTerm: {
    short: number;
    regular: number;
    unlimited: number;
  };
  proxy: {
    shared: {
      day: number;
      week: number;
      month: number;
    };
    exclusive: {
      day: number;
      week: number;
      month: number;
    };
  };
  device: {
    day: number;
    week: number;
    month: number;
  };
}> {
  return {
    oneTime: await SiteOptions.transactionCut.OneTime.get(),
    longTerm: {
      short: await SiteOptions.transactionCut.LongTerm.short.get(),
      regular: await SiteOptions.transactionCut.LongTerm.regular.get(),
      unlimited: await SiteOptions.transactionCut.LongTerm.unlimited.get(),
    },
    proxy: {
      shared: {
        day: await SiteOptions.transactionCut.Proxy.shared.day.get(),
        week: await SiteOptions.transactionCut.Proxy.shared.week.get(),
        month: await SiteOptions.transactionCut.Proxy.shared.month.get(),
      },
      exclusive: {
        day: await SiteOptions.transactionCut.Proxy.exclusive.day.get(),
        week: await SiteOptions.transactionCut.Proxy.exclusive.week.get(),
        month: await SiteOptions.transactionCut.Proxy.exclusive.month.get(),
      },
    },
    device: {
      day: await SiteOptions.transactionCut.Device.day.get(),
      week: await SiteOptions.transactionCut.Device.week.get(),
      month: await SiteOptions.transactionCut.Device.month.get(),
    },
  };
}
