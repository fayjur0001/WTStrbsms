"use server";

import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import { z } from "zod";
import serviceIdExistsValidator from "../../../validators/service-id-exists.validator";
import db from "@/db";
import apiUrl from "@/lib/utils/api-url";
import SiteOptions from "@/lib/utils/site-options";
import pusher from "@/lib/utils/pusher";

export default async function activateAction(
  data: unknown,
): Promise<ResponseWraper<unknown>> {
  try {
    const auth = getAuth();
    await validateUser(auth);

    const id = await parseData(data);

    await activate(id);

    const payload = await auth.getPayload();

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
        const message = await serviceIdExistsValidator(id);

        if (!!message) return ctx.addIssue({ message, code: "custom" });
      })
      .parseAsync(data);
  } catch {
    throw new UnloggingError("Invalid request.");
  }
}

async function activate(id: number) {
  const service = await db.query.LongTermRentsModel.findFirst({
    where: (model, { and, eq }) =>
      and(eq(model.id, id), eq(model.status, "Active")),
    columns: { mdn: true },
  });

  if (!service) throw new UnloggingError("Service not found.");

  const user = await SiteOptions.apiUser.get();
  const apiKey = await SiteOptions.apiKey.get();

  const url = new URL(apiUrl);
  url.searchParams.set("user", user);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("cmd", "ltr_activate");
  url.searchParams.set("mdn", service.mdn);

  const res:
    | {
        status: "ok";
      }
    | {
        status: "error";
        message: string;
      } = await fetch(url).then((r) => r.json());

  if (res.status === "error") throw new Error(res.message);
}

async function refresh(userId: number) {
  await pusher({
    page: "/tools/rent/history",
    to: `user-${userId}`,
  });
}
