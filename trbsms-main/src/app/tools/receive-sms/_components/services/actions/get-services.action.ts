"use server";

import apiUrl from "@/lib/utils/api-url";
import getAuth from "@/lib/utils/auth";
import SiteOptions from "@/lib/utils/site-options";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";

type Service = {
  name: string;
  price: string;
  ltr_price: string;
  ltr_short_price: string;
  available: string;
  ltr_available: string;
  recommended_markup: string;
};

type ApiResponse =
  | {
    status: "ok";
    message: Service[] | Record<string, Service>;
  }
  | {
    status: "error";
    message: string;
  }
  | Service[];

export default async function getServicesAction(): Promise<
  ResponseWraper<{
    services: Service[];
    cut: number;
  }>
> {
  try {
    await validateUser();

    const services = await getServices();

    const cut = await SiteOptions.transactionCut.OneTime.get();

    return {
      success: true,
      services,
      cut,
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

async function getServices(): Promise<Service[]> {
  const user = await SiteOptions.apiUser.get();
  const api_key = await SiteOptions.apiKey.get();

  const url = new URL(apiUrl);
  url.searchParams.set("cmd", "list_services");
  url.searchParams.set("user", user);
  url.searchParams.set("api_key", api_key);

  const res: ApiResponse = await fetch(url).then((r) => r.json());

  if (Array.isArray(res)) {
    return res;
  }

  if (res.status === "error") throw new UnloggingError(res.message);

  if (res.status === "ok") {
    if (Array.isArray(res.message)) {
      return res.message;
    }
    if (typeof res.message === "object") {
      return Object.values(res.message);
    }
  }

  throw new UnloggingError("Unexpected API response format.");
}
