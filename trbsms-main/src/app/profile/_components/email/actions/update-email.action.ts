"use server";

import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import schema from "../schemas/change-email.schema";
import { z } from "zod";
import db from "@/db";
import { UserModel } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function updateEmailAction(
  uData: unknown,
): Promise<ResponseWraper<unknown>> {
  try {
    const auth = getAuth();

    await validateUser(auth);
    const data = await validateData(uData);

    const user = await auth.getPayload();

    await updateEmail(data, user.id);

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

    console.trace(error);
    return {
      success: false,
      message: "Internal server error.",
    };
  }
}

async function validateUser(auth: ReturnType<typeof getAuth>) {
  if (!(await auth.verify([]))) {
    throw new UnloggingError("Unauthorized");
  }
}

async function validateData(data: unknown) {
  return await schema.parseAsync(data);
}

async function updateEmail(
  data: z.infer<typeof schema>,
  currentUserId: number,
) {
  await db.update(UserModel).set(data).where(eq(UserModel.id, currentUserId));
}
