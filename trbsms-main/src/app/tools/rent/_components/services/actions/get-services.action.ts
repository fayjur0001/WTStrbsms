"use server";

import apiUrl from "@/lib/utils/api-url";
import getAuth from "@/lib/utils/auth";
import SiteOptions from "@/lib/utils/site-options";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";

type Service = {
  name: string;
  available: number;
  price: number;
  shortPrice: number;
};

export default async function getServicesAction(): Promise<
  ResponseWraper<{
    services: Service[];
    adminCut: {
      short: number;
      regular: number;
      unlimited: number;
    };
  }>
> {
  try {
    await validateUser();

    const services = await getServices();

    const adminCut = {
      short: await SiteOptions.transactionCut.LongTerm.short.get(),
      regular: await SiteOptions.transactionCut.LongTerm.regular.get(),
      unlimited: await SiteOptions.transactionCut.LongTerm.unlimited.get(),
    };

    return { success: true, services, adminCut };
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
  const apiKey = await SiteOptions.apiKey.get();

  const url = new URL(apiUrl);
  url.searchParams.set("cmd", "list_services");
  url.searchParams.set("user", user);
  url.searchParams.set("api_key", apiKey);

  const res:
    | { status: "error"; message: string }
    | {
        status: "ok";
        message: {
          name: string;
          price: string;
          ltr_price: string;
          ltr_short_price: string;
          available: string;
          ltr_available: string;
        }[];
      } = await fetch(url).then((r) => r.json());

  if (res.status === "error") throw new UnloggingError(res.message);

  return res.message.map((service) => {
    const price = Number(service.ltr_price);

    const shortPrice = Number(service.ltr_short_price);

    return {
      name: service.name,
      price,
      shortPrice,
      available: Number(service.ltr_available),
    };
  });
}
