"use server";

import db from "@/db";
import { OneTimeRentModel } from "@/db/schema";
import apiUrl from "@/lib/utils/api-url";
import getAuth from "@/lib/utils/auth";
import SiteOptions from "@/lib/utils/site-options";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import { z } from "zod";
import getBalance from "@/lib/utils/get-balance";
import pusher from "@/lib/utils/pusher";
import suspensionCount from "@/lib/utils/suspension-count";

export default async function rentAction(
  data: unknown,
): Promise<ResponseWraper<unknown>> {
  try {
    const auth = getAuth();
    await validateUser(auth);

    const serviceName = parseData(data);

    const payload = await auth.getPayload();
    const user = await SiteOptions.apiUser.get();
    const apiKey = await SiteOptions.apiKey.get();

    await checkForSuspention(payload.id);

    const cut = await SiteOptions.transactionCut.OneTime.get();

    await canBuy({ apiKey, serviceName, user, userId: payload.id, cut });

    await rent({
      cut,
      serviceName,
      user,
      apiKey,
      userId: payload.id,
    });

    await refresh(payload.id);

    return { success: true };
  } catch (e) {
    if (e instanceof UnloggingError)
      return { success: false, message: e.message };

    console.trace(e);

    return { success: false, message: "Internal server error." };
  }
}

async function validateUser(auth: ReturnType<typeof getAuth>) {
  if (!(await auth.verify([]))) throw new UnloggingError("Unauthorized.");
}

function parseData(data: unknown) {
  try {
    return z.string().min(1).parse(data);
  } catch {
    throw new UnloggingError("Invalid request.");
  }
}

async function rent({
  userId,
  serviceName,
  user,
  apiKey,
  cut,
}: {
  userId: number;
  serviceName: string;
  user: string;
  apiKey: string;
  cut: number;
}) {
  const url = new URL(apiUrl);
  url.searchParams.set("cmd", "request");
  url.searchParams.set("user", user);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("service", serviceName);

  const res:
    | { status: "error"; message: string }
    | {
        status: "ok";
        message: {
          id: string;
          mdn: string;
          service: string;
          status: "Reserved" | "Awaiting MDN";
          state: string;
          price: number;
          carrier: string;
          till_expiration: number;
        }[];
      } = await fetch(url).then((r) => r.json());

  if (res.status === "error") throw new UnloggingError(res.message);

  const mdn = res.message.at(0)!;

  const price = Number(mdn.price);
  await db.insert(OneTimeRentModel).values({
    userId,
    requestId: mdn.id,
    mdn: mdn.mdn,
    service: mdn.service,
    status: mdn.status,
    state: mdn.state,
    price: price * (cut / 100) + price,
    originalPrice: price,
    carrier: mdn.carrier,
    tillExpiration: mdn.till_expiration,
  });
}

async function canBuy({
  userId,
  user,
  serviceName,
  apiKey,
  cut,
}: {
  userId: number;
  serviceName: string;
  user: string;
  apiKey: string;
  cut: number;
}) {
  const balance = await getBalance(userId);

  const url = new URL(apiUrl);
  url.searchParams.set("cmd", "list_services");
  url.searchParams.set("user", user);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("service", serviceName);

  const serviceRes:
    | { status: "error"; message: string }
    | {
        status: "ok";
        message: {
          name: string;
          price: string;
        }[];
      } = await fetch(url).then((r) => r.json());

  if (serviceRes.status === "error")
    throw new UnloggingError(serviceRes.message);

  const originalPrice = Number(serviceRes.message.at(0)?.price || 0);

  const price = originalPrice * (cut / 100) + originalPrice;

  if (balance < price) throw new UnloggingError("Not enough balance.");
}

async function refresh(userId: number) {
  await pusher({
    page: "/tools/receive-sms",
    to: `user-${userId}`,
  });

  await pusher({
    page: "/header/balance",
    to: `user-${userId}`,
  });
}

async function checkForSuspention(userId: number) {
  const transactions = await db.query.OneTimeRentModel.findMany({
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
