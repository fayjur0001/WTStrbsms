"use server";

import getAuth from "@/lib/utils/auth";
import serverAction from "@/lib/utils/server-action";
import UnloggingError from "@/lib/utils/unlogging-error";
import getBalance from "@/lib/utils/get-balance";
import apiUrl from "@/lib/utils/api-url";
import db from "@/db";
import { RentedProxyModel } from "@/db/schema";
import { sql } from "drizzle-orm";
import pusher from "@/lib/utils/pusher";
import SiteOptions from "@/lib/utils/site-options";
import getServices from "../utils/get-services";
import getHours from "../utils/get-hours";
import calculatePrice from "../utils/calculate-price";
import getSchema from "../schemas/get-filter.schema";

export default async function rentProxyAction(data: unknown) {
  return serverAction<unknown>(async () => {
    const auth = getAuth();

    if (!(await auth.verify([]))) throw new UnloggingError("Unauthorized.");

    const proxyTypeEnumArray = ["shared", "exclusive"] as [string, ...string[]];

    const unitTypeEnumArray = ["hour", "day", "week", "month"] as [
      string,
      ...string[],
    ];

    const user = await SiteOptions.apiUser.get();
    const apiKey = await SiteOptions.apiKey.get();

    const serviceEnumArray = await getServices(user, apiKey);

    const schema = getSchema({
      proxyTypeEnumArray,
      unitTypeEnumArray,
      serviceEnumArray,
    });

    const { port, proxyType, service, unit, unitType } = schema.parse(data);

    const payload = await auth.getPayload();

    const hours = getHours(unit, unitType);

    const prices = {
      shared: await SiteOptions.sharedProxyPrice.get(),
      exclusive: await SiteOptions.exclusiveProxyPrice.get(),
    };

    const price = calculatePrice({ hours, prices, proxyType });

    const balance = await getBalance(payload.id);

    if (balance < price) throw new UnloggingError("Insufficient balance.");

    const url = new URL(apiUrl);
    url.searchParams.set("cmd", "proxy_rent");
    url.searchParams.set("user", user);
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("port", port);
    url.searchParams.set("service", service);
    url.searchParams.set("duration", String(hours * 60));
    if (proxyType === "exclusive") url.searchParams.set("exclusive", "true");

    const res:
      | { status: "error"; message: string }
      | {
          status: "ok";
          message: {
            id: string;
            port: string;
            proxy_carrier: string;
            proxy_user: string;
            proxy_pass: string;
            proxy_ip: string;
            proxy_socks_port: number;
            proxy_http_port: number;
            price: string;
          };
        } = await fetch(url).then((r) => r.json());

    if (res.status === "error") throw new UnloggingError(res.message);

    await db.insert(RentedProxyModel).values({
      userId: payload.id,
      requestId: res.message.id,
      port: res.message.port,
      proxyCarrier: res.message.proxy_carrier,
      proxyUser: res.message.proxy_user,
      proxyPass: res.message.proxy_pass,
      proxyIp: res.message.proxy_ip,
      proxySocksPort: res.message.proxy_socks_port,
      proxyHttpPort: res.message.proxy_http_port,
      price,
      proxyType:
        proxyType as (typeof RentedProxyModel.proxyType.enumValues)[number],
      expirationDate: sql`CURRENT_TIMESTAMP + ${hours + " hour"}::interval`,
    });

    await pusher({
      page: "/proxy-lease/history",
      to: `user-${payload.id}`,
      payload: {
        action: "new",
      },
    });
  });
}
