"use server";

import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import schema from "../schemas/telegram.schema";
import { z } from "zod";
import db from "@/db";
import { UserModel } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function changeTelegramAction(
  uData: unknown,
): Promise<ResponseWraper<unknown>> {
  try {
    const auth = getAuth();

    await validateUser(auth);

    const payload = await auth.getPayload();

    const data = await parseData(uData);

    await updateTelegram(payload.id, data);

    return { success: true };
  } catch (error) {
    if (error instanceof UnloggingError) {
      return { success: false, message: error.message };
    }

    console.trace(error);
    return { success: false, message: "Internal Server Error." };
  }
}

async function validateUser(auth: ReturnType<typeof getAuth>) {
  if (!(await auth.verify([]))) {
    throw new UnloggingError("Unauthorized.");
  }
}

async function parseData(data: unknown) {
  return await schema.parseAsync(data);
}

async function updateTelegram(userId: number, data: z.infer<typeof schema>) {
  await db.update(UserModel).set(data).where(eq(UserModel.id, userId));
}
