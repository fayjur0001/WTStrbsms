"use server";

import apiUrl from "@/lib/utils/api-url";
import getAuth from "@/lib/utils/auth";
import serverAction from "@/lib/utils/server-action";
import SiteOptions from "@/lib/utils/site-options";
import UnloggingError from "@/lib/utils/unlogging-error";

type Proxy = {
  port: string;
  location: string;
  carrier: string;
  redialInterval: string;
  leases: string;
  services: string | null;
  isExclusive: boolean;
};

export default async function getProxies() {
  return serverAction<{ proxies: Proxy[] }>(async () => {
    const auth = getAuth();

    if (!(await auth.verify([]))) throw new UnloggingError("unauthorized.");

    const user = await SiteOptions.apiUser.get();
    const apiKey = await SiteOptions.apiKey.get();

    const url = new URL(apiUrl);
    url.searchParams.set("cmd", "proxy_list");
    url.searchParams.set("user", user);
    url.searchParams.set("api_key", apiKey);

    const res:
      | { status: "error"; message: string }
      | {
          status: "ok";
          message: {
            port: string;
            location: string;
            carrier: string;
            redial_interval: string;
            leases: string;
            services: string | null;
            is_exclusive: boolean;
          }[];
        } = await fetch(url).then((r) => r.json());

    if (res.status === "error") throw new UnloggingError(res.message);

    return {
      proxies: res.message.map(
        ({ is_exclusive, redial_interval, ...proxy }): Proxy => ({
          ...proxy,
          isExclusive: is_exclusive,
          redialInterval: redial_interval,
        }),
      ),
    };
  });
}
