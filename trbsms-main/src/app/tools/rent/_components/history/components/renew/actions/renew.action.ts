"use server";

import getAuth from "@/lib/utils/auth";
import serverAction from "@/lib/utils/server-action";
import UnloggingError from "@/lib/utils/unlogging-error";
import schema from "../schemas/renew.schems";
import db from "@/db";
import apiUrl from "@/lib/utils/api-url";
import SiteOptions from "@/lib/utils/site-options";
import getBalance from "@/lib/utils/get-balance";
import { LongTermRentsModel } from "@/db/schema";
import pusher from "@/lib/utils/pusher";

export default async function renewAction(data: unknown) {
  return serverAction(async () => {
    const auth = getAuth();

    if (!(await auth.verify([]))) throw new UnloggingError("Unauthorized");

    const { id, rentType } = await parse(data);

    const service = await getService(id);

    const user = await SiteOptions.apiUser.get();
    const apiKey = await SiteOptions.apiKey.get();

    const price = await calculatePrice({
      apiKey,
      rentType,
      serviceName: service.service,
      user,
    });

    const payload = await auth.getPayload();

    await canRenew(payload.id, price);

    await renew({
      apiKey,
      mdn: service.mdn,
      serviceName: service.service,
      user,
      rentType,
      price,
      userId: payload.id,
    });

    await refresh(payload.id);
  });
}

async function getService(id: number) {
  const service = await db.query.LongTermRentsModel.findFirst({
    where: (model, { eq }) => eq(model.id, id),
    columns: { service: true, mdn: true },
  });

  if (!service) throw new UnloggingError("Service not found");

  return service;
}

async function parse(data: unknown) {
  try {
    return await schema.parseAsync(data);
  } catch {
    throw new UnloggingError("Unauthorized");
  }
}

async function calculatePrice({
  user,
  apiKey,
  serviceName,
  rentType,
}: {
  user: string;
  apiKey: string;
  serviceName: string;
  rentType: Awaited<ReturnType<typeof parse>>["rentType"];
}): Promise<number> {
  const url = new URL(apiUrl);

  url.searchParams.set("cmd", "list_services");
  url.searchParams.set("user", user);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("service", serviceName);

  const res:
    | { status: "error"; message: string }
    | {
        status: "ok";
        message: {
          ltr_price: string;
          ltr_short_price: string;
        }[];
      } = await fetch(url).then((r) => r.json());

  if (res.status === "error") throw new UnloggingError(res.message);

  const service = res.message.at(0);

  if (!service) throw new UnloggingError("Service not found.");

  let price = Number(
    rentType === "short" ? service.ltr_short_price : service.ltr_price,
  );

  if (rentType === "unlimited") price += 5;

  const cut =
    rentType === "short"
      ? await SiteOptions.transactionCut.LongTerm.short.get()
      : rentType === "regular"
        ? await SiteOptions.transactionCut.LongTerm.regular.get()
        : await SiteOptions.transactionCut.LongTerm.unlimited.get();

  price = price + price * (cut / 100);

  return price;
}

async function canRenew(userId: number, price: number) {
  const balance = await getBalance(userId);

  if (balance < price)
    throw new UnloggingError("Not enough balance. Please top up.");
}

async function renew({
  user,
  apiKey,
  serviceName,
  mdn,
  rentType,
  price,
  userId,
}: {
  user: string;
  apiKey: string;
  serviceName: string;
  mdn: string;
  rentType: Awaited<ReturnType<typeof parse>>["rentType"];
  price: number;
  userId: number;
}) {
  const url = new URL(apiUrl);

  url.searchParams.set("cmd", "ltr_rent");
  url.searchParams.set("user", user);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("service", serviceName);
  url.searchParams.set("mdn", mdn);
  if (rentType !== "unlimited")
    url.searchParams.set("duration", rentType === "short" ? "3" : "30");
  else url.searchParams.set("reserve", "true");

  const res:
    | {
        status: "error";
        message: string;
      }
    | {
        status: "ok";
        message: {
          id: string;
          mdn: string;
          service: string;
          expires: string;
        };
      } = await fetch(url).then((r) => r.json());

  if (res.status === "error") throw new UnloggingError(res.message);

  const statusUrl = new URL(apiUrl);
  statusUrl.searchParams.set("cmd", "ltr_status");
  statusUrl.searchParams.set("user", user);
  statusUrl.searchParams.set("api_key", apiKey);
  statusUrl.searchParams.set("ltr_id", res.message.id);

  const statusRes:
    | {
        status: "error";
        message: string;
      }
    | {
        status: "ok";
        message:
          | {
              ltr_status: (typeof LongTermRentsModel.onlineStatus.enumValues)[number];
            }
          | {
              ltr_status: "online" | "offline";
            };
      } = await fetch(statusUrl).then((r) => r.json());

  if (statusRes.status === "error") throw new UnloggingError(statusRes.message);

  const days = rentType === "short" ? 3 : 30;

  const date = new Date();

  const expirationDate = new Date(date);
  expirationDate.setDate(expirationDate.getDate() + days);

  await db.insert(LongTermRentsModel).values({
    expirationDate: expirationDate,
    mdn: res.message.mdn,
    price,
    requestId: res.message.id,
    service: serviceName,
    status: "Active",
    userId,
    onlineStatus: statusRes.message.ltr_status,
    createdAt: date,
    updatedAt: date,
    rentType,
  });
}

async function refresh(userId: number) {
  await pusher({
    page: "/tools/rent/history",
    to: `user-${userId}`,
  });
  await pusher({
    page: "/header/balance",
    to: `user-${userId}`,
  });
}
