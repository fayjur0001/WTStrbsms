"use server";

import db from "@/db";
import { LongTermRentsModel } from "@/db/schema";
import apiUrl from "@/lib/utils/api-url";
import getAuth from "@/lib/utils/auth";
import getBalance from "@/lib/utils/get-balance";
import pusher from "@/lib/utils/pusher";
import SiteOptions from "@/lib/utils/site-options";
import suspensionCount from "@/lib/utils/suspension-count";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import { z } from "zod";

export default async function rentAction(
  data: unknown,
): Promise<ResponseWraper<unknown>> {
  try {
    const auth = getAuth();
    await validateUser(auth);

    const { name, rentType } = parseData(data);

    const payload = await auth.getPayload();

    await checkForSuspention(payload.id);

    const user = await SiteOptions.apiUser.get();
    const apiKey = await SiteOptions.apiKey.get();

    const price = await getPrice({ apiKey, name, user, rentType });

    await canBuy(payload.id, price);

    await rent({ apiKey, name, price, rentType, user, userId: payload.id });

    await refresh(payload.id);

    return { success: true };
  } catch (e) {
    if (e instanceof UnloggingError)
      return { success: false, message: e.message };

    console.trace(e);
    return { success: false, message: "Internal server error." };
  }
}

async function getPrice({
  user,
  apiKey,
  name,
  rentType,
}: {
  name: string;
  user: string;
  apiKey: string;
  rentType: ReturnType<typeof parseData>["rentType"];
}): Promise<number> {
  const url = new URL(apiUrl);
  url.searchParams.set("cmd", "list_services");
  url.searchParams.set("user", user);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("service", name);

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

async function validateUser(auth: ReturnType<typeof getAuth>) {
  if (!(await auth.verify([]))) throw new UnloggingError("Unauthorized.");
}

function parseData(data: unknown) {
  try {
    return z
      .object({
        name: z.string().min(1, "Name is required."),
        rentType: z.enum(["short", "regular", "unlimited"]),
      })
      .parse(data);
  } catch {
    throw new UnloggingError("Invalid request.");
  }
}

async function canBuy(userId: number, price: number) {
  const balance = await getBalance(userId);

  if (balance < price) throw new UnloggingError("Not enough balance.");
}

async function rent({
  name,
  price,
  user,
  apiKey,
  rentType,
  userId,
}: {
  name: string;
  userId: number;
  price: number;
  user: string;
  apiKey: string;
  rentType: ReturnType<typeof parseData>["rentType"];
}) {
  const url = new URL(apiUrl);
  url.searchParams.set("cmd", "ltr_rent");
  url.searchParams.set("user", user);
  url.searchParams.set("api_key", apiKey);
  if (rentType !== "unlimited")
    url.searchParams.set("duration", rentType === "short" ? "3" : "30");
  else url.searchParams.set("reserve", "true");
  url.searchParams.set("autorenew", "false");
  url.searchParams.set("service", name);

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
    service: name,
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

async function checkForSuspention(userId: number) {
  const transactions = await db.query.LongTermRentsModel.findMany({
    columns: { createdAt: true, service: true, status: true },
    limit: suspensionCount,
    orderBy: ({ createdAt }, { desc }) => desc(createdAt),
    where: (model, { eq }) => eq(model.userId, userId),
  });

  if (transactions.length < suspensionCount) return;

  if (
    (transactions.at(0)?.createdAt.getTime() || 0) + 1000 * 60 * 60 * 3 <
    Date.now()
  )
    return;

  if (!transactions.every((t) => t.status === "Rejected")) return;

  throw new UnloggingError(
    `You are suspended for suspicious activity. You will be functional in ${timeFormatter((transactions.at(0)?.createdAt.getTime() || 0) + 1000 * 60 * 60 * 3 - Date.now())}.`,
  );
}

function timeFormatter(ms: number): string {
  const hour = Math.floor(ms / 1000 / 60 / 60);
  const minute = Math.floor((ms / 1000 / 60) % 60);
  const second = Math.floor((ms / 1000) % 60);

  if (!!hour)
    return `${String(hour).padStart(2, "0")}h ${String(minute).padStart(
      2,
      "0",
    )}m ${String(second).padStart(2, "0")}s`;

  if (!!minute)
    return `${String(minute).padStart(2, "0")}m ${String(second).padStart(
      2,
      "0",
    )}s`;

  return `${String(second).padStart(2, "0")}s`;
}
