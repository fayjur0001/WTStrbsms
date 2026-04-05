"use server";

import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import { z } from "zod";
import serviceIdExistsValidator from "../../../validators/service-id-exists.validator";
import db from "@/db";

export default async function canReleaseAction(
  data: unknown,
): Promise<ResponseWraper<{ canRelease: boolean }>> {
  try {
    const auth = getAuth();
    await validateUser(auth);

    const id = await parseData(data);

    const payload = await auth.getPayload();

    const canRelease = await getCanRelease(payload.id, id);

    return { success: true, canRelease };
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

async function getCanRelease(userId: number, id: number) {
  const service = await db.query.LongTermRentsModel.findFirst({
    where: (model, { eq, and, notInArray }) =>
      and(
        eq(model.id, id),
        eq(model.userId, userId),
        notInArray(model.status, ["Expired", "Rejected", "Completed"]),
      ),
    columns: { requestId: true },
  });

  if (!service) return false;

  const message = await db.query.MDNMessageModel.findFirst({
    columns: { id: true },
    where: (model, { eq, and }) =>
      and(eq(model.requestId, service.requestId), eq(model.type, "long_term")),
  });

  if (message) return false;

  return true;
}
