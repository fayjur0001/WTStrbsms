"use server";

import ResponseWraper from "@/types/response-wraper.type";
import { FieldPath } from "react-hook-form";
import schema from "../schemas/pin-code.schema";
import UnloggingError from "@/lib/utils/unlogging-error";
import { z } from "zod";
import getAuth from "@/lib/utils/auth";
import db from "@/db";
import bcrypt from "bcryptjs";
import { UserModel } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function changePinCodeAction(
  uData: unknown,
): Promise<ResponseWraper<unknown, FieldPath<z.infer<typeof schema>>>> {
  try {
    const auth = getAuth();

    await validateUser(auth);
    const data = parseData(uData);

    const payload = await auth.getPayload();

    await changePinCode(payload.id, data);

    return { success: true };
  } catch (error) {
    if (error instanceof FieldError) {
      return {
        success: false,
        field: error.field,
        message: error.message,
      };
    }

    if (error instanceof UnloggingError) {
      return {
        success: false,
        message: error.message,
      };
    }

    console.trace(error);
    return {
      success: false,
      message: "Internal server error.",
    };
  }
}

class FieldError extends Error {
  constructor(
    message: string,
    public field: FieldPath<z.infer<typeof schema>>,
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

async function changePinCode(userId: number, data: z.infer<typeof schema>) {
  const oldPinCode = await db.query.UserModel.findFirst({
    where: (model, { eq }) => eq(model.id, userId),
    columns: { pinCode: true },
  });

  if (!oldPinCode) {
    throw new Error("User not found.");
  }

  if (!!oldPinCode.pinCode) {
    if (!bcrypt.compareSync(data.oldPinCode, oldPinCode.pinCode)) {
      throw new FieldError("Old pin code is incorrect.", "oldPinCode");
    }
  }

  await db
    .update(UserModel)
    .set({
      pinCode: bcrypt.hashSync(data.newPinCode, bcrypt.genSaltSync()),
    })
    .where(eq(UserModel.id, userId));
}
