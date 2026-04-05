"use server";

import ResponseWraper from "@/types/response-wraper.type";
import { z } from "zod";
import schema from "../schemas/code.schema";
import UnloggingError from "@/lib/utils/unlogging-error";
import getAuth from "@/lib/utils/auth";
import db from "@/db";
import bcrypt from "bcryptjs";

export default async function checkPinCodeAction(
  data: unknown,
): Promise<ResponseWraper<unknown, keyof z.infer<typeof schema>>> {
  try {
    await validateUser();

    const { id, code } = await parse(data);

    const checkData = await checkPinCode(id, code);

    const { success } = checkData;

    if (!success)
      return {
        success,
        field: "code",
        message: `Invalid pin code, Cancel all requests from ${checkData.username}.`,
      };

    return { success };
  } catch (e) {
    if (e instanceof UnloggingError)
      return { success: false, message: e.message };

    console.trace(e);
    return { success: false, message: "Internal server error" };
  }
}

async function validateUser() {
  const auth = getAuth();

  if (!(await auth.verify(["admin", "super admin"])))
    throw new UnloggingError("Unauthorized.");
}

async function parse(data: unknown) {
  try {
    return await schema.parseAsync(data);
  } catch {
    throw new UnloggingError("Bad request.");
  }
}

async function checkPinCode(
  id: number,
  code: string,
): Promise<{ success: true } | { success: false; username: string }> {
  const user: { username: string; pinCode: string | null } | undefined =
    await db.query.UserModel.findFirst({
      where: (model, { eq }) => eq(model.id, id),
      columns: { username: true, pinCode: true },
    });

  if (!user) throw new UnloggingError("User not found.");

  if (!user.pinCode || !bcrypt.compareSync(code, user.pinCode))
    return { success: false, username: user.username };

  return { success: true };
}
