"use server";

import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import { z } from "zod";
import mdnIdExistsValidator from "../../validators/mdn-id-exists.validator";
import apiUrl from "@/lib/utils/api-url";
import SiteOptions from "@/lib/utils/site-options";
import db from "@/db";
import { OneTimeRentModel } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import pusher from "@/lib/utils/pusher";

export default async function rejectAction(
  data: unknown,
): Promise<ResponseWraper<unknown>> {
  try {
    const auth = getAuth();
    await validateUser(auth);

    const id = await parseData(data);

    const payload = await auth.getPayload();

    await reject(id, payload.id);

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

async function reject(id: number, userId: number) {
  const user = await SiteOptions.apiUser.get();
  const apiKey = await SiteOptions.apiKey.get();

  const requestId: string | undefined = await db
    .select({ requestId: OneTimeRentModel.requestId })
    .from(OneTimeRentModel)
    .where(
      and(eq(OneTimeRentModel.id, id), eq(OneTimeRentModel.userId, userId)),
    )
    .then((r) => r.at(0)?.requestId);

  if (!requestId) throw new UnloggingError("Unknown error.");

  const url = new URL(apiUrl);
  url.searchParams.set("user", user);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("cmd", "reject");
  url.searchParams.set("id", requestId);

  const res: { status: "error" | "ok"; message: string } = await fetch(
    url,
  ).then((r) => r.json());

  if (res.status === "error") throw new UnloggingError(res.message);

  await db
    .update(OneTimeRentModel)
    .set({
      status: "Rejected",
    })
    .where(
      and(eq(OneTimeRentModel.id, id), eq(OneTimeRentModel.userId, userId)),
    );
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
