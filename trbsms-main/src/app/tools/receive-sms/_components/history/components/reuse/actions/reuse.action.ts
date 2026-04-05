"use server";

import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import { z } from "zod";
import mdnIdExistsValidator from "../../validators/mdn-id-exists.validator";
import db from "@/db";
import SiteOptions from "@/lib/utils/site-options";
import apiUrl from "@/lib/utils/api-url";
import { OneTimeRentModel } from "@/db/schema";
import getBalance from "@/lib/utils/get-balance";
import pusher from "@/lib/utils/pusher";

export default async function reuseAction(
  data: unknown,
): Promise<ResponseWraper<unknown>> {
  try {
    const auth = getAuth();
    await validateUser(auth);

    const id = await parseData(data);

    const payload = await auth.getPayload();

    const apiKey = await SiteOptions.apiKey.get();
    const user = await SiteOptions.apiUser.get();
    const cut = await SiteOptions.transactionCut.OneTime.get();

    await canBuy({
      apiKey,
      id,
      user,
      userId: payload.id,
      cut,
    });

    await reuse({
      apiKey,
      id,
      user,
      userId: payload.id,
      cut,
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

async function parseData(data: unknown) {
  try {
    return await z.coerce
      .number()
      .min(1)
      .superRefine(async (id, ctx) => {
        const message = await mdnIdExistsValidator(id);

        if (!!message) return ctx.addIssue({ message, code: "custom" });
      })
      .parseAsync(data);
  } catch {
    throw new UnloggingError("Invalid request.");
  }
}

async function reuse({
  id,
  userId,
  user,
  apiKey,
  cut,
}: {
  id: number;
  userId: number;
  user: string;
  apiKey: string;
  cut: number;
}) {
  const service: { mdn: string; service: string } | undefined =
    await db.query.OneTimeRentModel.findFirst({
      where: (model, { and, eq }) =>
        and(eq(model.id, id), eq(model.userId, userId)),
      columns: { mdn: true, service: true },
    });

  if (!service) throw new UnloggingError("MDN not found.");

  const url = new URL(apiUrl);

  url.searchParams.set("cmd", "request");
  url.searchParams.set("user", user);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("service", service.service);
  url.searchParams.set("mdn", service.mdn);

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
          status: (typeof OneTimeRentModel.status.enumValues)[number];
          state: string;
          price: string;
          carrier: string;
          till_expiration: number;
        }[];
      } = await fetch(url).then((r) => r.json());

  if (res.status === "error") throw new UnloggingError(res.message);

  const data = res.message.at(0);

  if (!data) throw new UnloggingError("MDN not found.");

  const price = (Number(data.price) * cut) / 100 + Number(data.price);

  await db.insert(OneTimeRentModel).values({
    carrier: data.carrier,
    mdn: data.mdn,
    price,
    requestId: data.id,
    service: data.service,
    state: data.state,
    status: data.status,
    tillExpiration: data.till_expiration,
    userId,
    originalPrice: Number(data.price),
  });
}

async function canBuy({
  userId,
  id,
  user,
  apiKey,
  cut,
}: {
  id: number;
  userId: number;
  user: string;
  apiKey: string;
  cut: number;
}) {
  const balance = await getBalance(userId);

  const serviceName: string | undefined =
    await db.query.OneTimeRentModel.findFirst({
      where: (model, { eq, and }) =>
        and(eq(model.id, id), eq(model.userId, userId)),
      columns: { service: true },
    }).then((r) => r?.service);

  if (!serviceName) throw new UnloggingError("MDN not found.");

  const url = new URL(apiUrl);

  url.searchParams.set("cmd", "list_services");
  url.searchParams.set("user", user);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("service", serviceName);

  const serviceRes:
    | {
        status: "error";
        message: string;
      }
    | {
        status: "ok";
        message: {
          price: string;
        }[];
      } = await fetch(url).then((r) => r.json());

  if (serviceRes.status === "error")
    throw new UnloggingError(serviceRes.message);

  const data = serviceRes.message.at(0);

  if (!data) throw new UnloggingError("MDN not found.");

  const price = (Number(data.price) * cut) / 100 + Number(data.price);

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
