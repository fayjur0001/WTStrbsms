"use server";

import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import schema from "../schemas/change-username.schema";
import { z } from "zod";
import db from "@/db";
import { UserDeviceModel, UserModel } from "@/db/schema";
import Payload from "@/types/payload.type";
import { eq } from "drizzle-orm";

export default async function changeUsernameAction(
  uData: unknown,
): Promise<ResponseWraper> {
  try {
    const auth = getAuth();

    await validateUser(auth);
    const data = await parseData(uData);

    const payload = await auth.getPayload();

    await changeUsername(data, payload);
    await grantNewAccess(data, auth, payload);

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
    throw new UnloggingError("Unauthorized.");
  }
}

async function parseData(data: unknown) {
  return await schema.parseAsync(data);
}

async function changeUsername(data: z.infer<typeof schema>, payload: Payload) {
  await db
    .update(UserModel)
    .set({ username: data.username })
    .where(eq(UserModel.id, payload.id));
}

async function grantNewAccess(
  data: z.infer<typeof schema>,
  auth: ReturnType<typeof getAuth>,
  payload: Payload,
) {
  const oldToken = await auth.getToken();

  if (!oldToken) {
    throw new UnloggingError("Unauthorized.");
  }

  await db.delete(UserDeviceModel).where(eq(UserDeviceModel.token, oldToken));

  payload.username = data.username;

  const token = await auth.setToken(payload);

  await db.insert(UserDeviceModel).values({
    token,
    userId: payload.id,
  });
}
