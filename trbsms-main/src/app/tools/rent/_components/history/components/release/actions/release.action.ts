"use server";

import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import canReleaseAction from "./can-release.action";
import { z } from "zod";
import serviceIdExistsValidator from "../../../validators/service-id-exists.validator";
import SiteOptions from "@/lib/utils/site-options";
import apiUrl from "@/lib/utils/api-url";
import db from "@/db";
import { LongTermRentsModel } from "@/db/schema";
import { eq } from "drizzle-orm";
import pusher from "@/lib/utils/pusher";

export default async function releaseAction(
  data: unknown,
): Promise<ResponseWraper<unknown>> {
  try {
    const auth = getAuth();
    await validateUser(auth);
    const id = await parseData(data);

    const payload = await auth.getPayload();

    const canRelease = await canReleaseAction(id);
    if (!canRelease.success) throw new UnloggingError(canRelease.message);

    if (!canRelease.canRelease) throw new UnloggingError("Can't release.");

    await release(id);
    await refresh(payload.id, id);

    return { success: true };
  } catch (e) {
    if (e instanceof UnloggingError)
      return { success: false, message: e.message };

    console.trace(e);
    return { success: false, message: "Internal server error" };
  }
}

async function release(id: number) {
  const user = await SiteOptions.apiUser.get();
  const apiKey = await SiteOptions.apiKey.get();

  const service = await db.query.LongTermRentsModel.findFirst({
    where: (model, { eq }) => eq(model.id, id),
    columns: { requestId: true },
  });

  if (!service) throw new UnloggingError("Service not found.");

  const url = new URL(apiUrl);
  url.searchParams.set("user", user);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("cmd", "ltr_release");
  url.searchParams.set("ltr_id", service.requestId);

  const res:
    | {
        status: "error";
        message: string;
      }
    | {
        status: "ok";
      } = await fetch(url).then((r) => r.json());

  if (res.status === "error") throw new UnloggingError(res.message);

  await db
    .update(LongTermRentsModel)
    .set({
      status: "Rejected",
      onlineStatus: "offline",
    })
    .where(eq(LongTermRentsModel.id, id));
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
        const message = await serviceIdExistsValidator(id);

        if (!!message) return ctx.addIssue({ message, code: "custom" });
      })
      .parseAsync(data);
  } catch {
    throw new UnloggingError("Invalid request.");
  }
}

async function refresh(userId: number, id: number) {
  await pusher({
    page: "/header/balance",
    to: `user-${userId}`,
  });
  await pusher({
    page: "/tools/rent/history",
    to: `user-${userId}`,
  });
  await pusher({
    page: `/tools/rent/history/can-release/${id}`,
    to: `user-${userId}`,
  });
}
