"use server";

import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import { z } from "zod";
import idExistsValidator from "../../../validators/id-exists.validator";
import Payload from "@/types/payload.type";
import db from "@/db";

export default async function loginAsAction(
  data: unknown,
): Promise<ResponseWraper<unknown>> {
  try {
    const auth = getAuth();

    await validateUser(auth);
    const id = await parse(data);
    await loginAs(id, auth);

    return { success: true };
  } catch (e) {
    if (e instanceof UnloggingError)
      return { success: false, message: e.message };

    console.trace(e);
    return { success: false, message: "Internal server error." };
  }
}

async function validateUser(auth: ReturnType<typeof getAuth>) {
  if (!(await auth.verify(["admin", "super admin"])))
    throw new UnloggingError("Unauthorized.");
}

async function parse(data: unknown) {
  try {
    return await z.coerce
      .number()
      .min(1)
      .superRefine(async (id, ctx) => {
        const message = await idExistsValidator(id);

        if (!!message) return ctx.addIssue({ message, code: "custom" });
      })
      .parseAsync(data);
  } catch {
    throw new UnloggingError("Bad request.");
  }
}

async function loginAs(id: number, auth: ReturnType<typeof getAuth>) {
  const user = await db.query.UserModel.findFirst({
    where: (model, { eq }) => eq(model.id, id),
    columns: { username: true, role: true },
  });

  if (!user) throw new UnloggingError("User not found.");

  const payload: Payload = {
    id,
    isShadowAdmin: true,
    username: user.username,
    role: user.role,
  };

  await auth.setToken(payload, 0);
}
