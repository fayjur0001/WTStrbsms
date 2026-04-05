"use server";

import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import schema from "../schemas/register.schema";
import { z } from "zod";
import db from "@/db";
import { UserModel } from "@/db/schema";
import bcrypt from "bcryptjs";

export default async function registerAction(
  uData: unknown,
): Promise<ResponseWraper> {
  try {
    const auth = getAuth();

    await validateUser(auth);
    const data = await parseData(uData);
    await registerUser(data);

    return {
      success: true,
    };
  } catch (e) {
    if (e instanceof UnloggingError) {
      return {
        success: false,
        message: e.message,
      };
    }

    console.trace(e);
    return {
      success: false,
      message: "Internal Server Error.",
    };
  }
}

async function validateUser(auth: ReturnType<typeof getAuth>) {
  if (!(await auth.verify())) {
    throw new UnloggingError("Unauthorized.");
  }
}

async function parseData(data: unknown) {
  return await schema.parseAsync(data);
}

async function registerUser(data: z.infer<typeof schema>) {
  const hasPreviousUser: boolean = await db.query.UserModel.findFirst({
    columns: { id: true },
  }).then((r) => !!r);

  await db.insert(UserModel).values({
    ...data,
    password: bcrypt.hashSync(data.password, bcrypt.genSaltSync()),
    role: hasPreviousUser ? "general" : "super admin",
    pinCode: !!data.pinCode
      ? bcrypt.hashSync(data.pinCode, bcrypt.genSaltSync())
      : null,
  });
}
