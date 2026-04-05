"use server";

import getAuth from "@/lib/utils/auth";
import SiteOptions from "@/lib/utils/site-options";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import schema from "../schemas/schema";

export default async function setApiSettingsAction(
  data: unknown,
): Promise<ResponseWraper<unknown>> {
  try {
    await validateUser();

    const {
      cut,
      apiUser,
      apiKey,
      exclusiveProxyPrice,
      sharedProxyPrice,
      callbackSecret,
      devices,
    } = parseData(data);

    await setCut(cut);

    await SiteOptions.apiUser.set(apiUser);

    await SiteOptions.apiKey.set(apiKey);

    await SiteOptions.exclusiveProxyPrice.set(exclusiveProxyPrice);

    await SiteOptions.sharedProxyPrice.set(sharedProxyPrice);

    await SiteOptions.providerCallbackSecret.set(callbackSecret);

    await SiteOptions.devices.login.set(devices.login);
    await SiteOptions.devices.password.set(devices.password);

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

  if (!(await auth.verify(["super admin"])))
    throw new UnloggingError("Unauthorized.");
}

function parseData(data: unknown) {
  try {
    return schema.parse(data);
  } catch {
    throw new UnloggingError("Invalid request.");
  }
}

async function setCut(cut: {
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
}) {
  await SiteOptions.transactionCut.OneTime.set(cut.oneTime);
  await SiteOptions.transactionCut.LongTerm.short.set(cut.longTerm.short);
  await SiteOptions.transactionCut.LongTerm.regular.set(cut.longTerm.regular);
  await SiteOptions.transactionCut.LongTerm.unlimited.set(
    cut.longTerm.unlimited,
  );

  await SiteOptions.transactionCut.Proxy.shared.day.set(cut.proxy.shared.day);
  await SiteOptions.transactionCut.Proxy.shared.week.set(cut.proxy.shared.week);
  await SiteOptions.transactionCut.Proxy.shared.month.set(
    cut.proxy.shared.month,
  );

  await SiteOptions.transactionCut.Proxy.exclusive.day.set(
    cut.proxy.exclusive.day,
  );
  await SiteOptions.transactionCut.Proxy.exclusive.week.set(
    cut.proxy.exclusive.week,
  );
  await SiteOptions.transactionCut.Proxy.exclusive.month.set(
    cut.proxy.exclusive.month,
  );

  await SiteOptions.transactionCut.Device.day.set(cut.device.day);
  await SiteOptions.transactionCut.Device.week.set(cut.device.week);
  await SiteOptions.transactionCut.Device.month.set(cut.device.month);
}
