"use server";

import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import { z } from "zod";
import schema from "../schemas/change-password.schema";
import db from "@/db";
import bcrypt from "bcryptjs";
import { UserModel } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function changePasswordAction(
  uData: unknown,
): Promise<ResponseWraper<unknown, keyof z.infer<typeof schema>>> {
  try {
    const auth = getAuth();

    await validateUser(auth);
    const data = parseData(uData);

    const payload = await auth.getPayload();

    await changePassword(payload.id, data);

    return {
      success: true,
    };
  } catch (error) {
    if (error instanceof UnloggingError) {
      return {
        success: false,
        message: error.message,
      };
    }

    if (error instanceof FieldError) {
      return {
        success: false,
        message: error.message,
        field: error.field,
      };
    }

    console.trace(error);
    return {
      success: false,
      message: "Internal server error.",
    };
  }
}

class FieldError<Field> extends Error {
  constructor(
    message: string,
    public field: Field,
  ) {
    super(message);
  }
}

async function validateUser(auth: ReturnType<typeof getAuth>) {
  if (!(await auth.verify([]))) {
    throw new UnloggingError("Unauthorized.");
  }
}

function parseData(data: unknown) {
  return schema.parse(data);
}

async function changePassword(id: number, data: z.infer<typeof schema>) {
  const oldPassword = await db.query.UserModel.findFirst({
    where: (model, { eq }) => eq(model.id, id),
    columns: { password: true },
  });

  if (!oldPassword) {
    throw new Error("User not found.");
  }

  if (!bcrypt.compareSync(data.oldPassword, oldPassword.password)) {
    throw new FieldError<keyof z.infer<typeof schema>>(
      "Old password is incorrect.",
      "oldPassword",
    );
  }

  await db
    .update(UserModel)
    .set({
      password: bcrypt.hashSync(data.newPassword, bcrypt.genSaltSync()),
    })
    .where(eq(UserModel.id, id));
}
