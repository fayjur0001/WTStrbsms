"use server";

import db from "@/db";
import { RentedProxyModel } from "@/db/schema";
import apiUrl from "@/lib/utils/api-url";
import getAuth from "@/lib/utils/auth";
import pusher from "@/lib/utils/pusher";
import serverAction from "@/lib/utils/server-action";
import SiteOptions from "@/lib/utils/site-options";
import UnloggingError from "@/lib/utils/unlogging-error";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

export default async function changePortAction(data: unknown) {
  return serverAction(async () => {
    const payload = await validateUser();
    const id = await parse(data, payload.id);
    await changePort(id);
    await refresh(id, payload.id);
  });
}

async function validateUser() {
  const auth = getAuth();

  if (!(await auth.verify([]))) throw new UnloggingError("Unauthorized.");

  return await auth.getPayload();
}

async function parse(data: unknown, userId: number) {
  try {
    return await z.coerce
      .number()
      .min(1)
      .superRefine(async (id, ctx) => {
        const proxy = await db
          .select({ id: RentedProxyModel.id })
          .from(RentedProxyModel)
          .where(
            and(
              eq(RentedProxyModel.id, id),
              eq(RentedProxyModel.userId, userId),
              sql`${RentedProxyModel.expirationDate} >= now()`,
            ),
          );

        if (!proxy)
          return ctx.addIssue({ message: "Proxy not found.", code: "custom" });
      })
      .parseAsync(data);
  } catch {
    throw new UnloggingError("Bad Request.");
  }
}

async function changePort(id: number) {
  const requestId: string | undefined =
    await db.query.RentedProxyModel.findFirst({
      where: (model, { eq }) => eq(model.id, id),
      columns: { requestId: true },
    }).then((r) => r?.requestId);

  if (!requestId) throw new UnloggingError("Proxy not found.");

  const user = await SiteOptions.apiUser.get();
  const apiKey = await SiteOptions.apiKey.get();

  const url = new URL(apiUrl);
  url.searchParams.set("cmd", "proxy_swap");
  url.searchParams.set("user", user);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("id", requestId);

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
        };
      } = await fetch(url).then((r) => r.json());

  if (res.status === "error") throw new UnloggingError(res.message);

  await db
    .update(RentedProxyModel)
    .set({
      requestId: res.message.id,
      port: res.message.port,
      proxyCarrier: res.message.proxy_carrier,
      proxyUser: res.message.proxy_user,
      proxyPass: res.message.proxy_pass,
      proxyIp: res.message.proxy_ip,
      proxySocksPort: res.message.proxy_socks_port,
      proxyHttpPort: res.message.proxy_http_port,
    })
    .where(eq(RentedProxyModel.id, id));
}

async function refresh(id: number, userId: number) {
  await pusher({
    page: "/proxy-lease/history",
    to: `user-${userId}`,
    payload: { action: "update", id },
  });
}
