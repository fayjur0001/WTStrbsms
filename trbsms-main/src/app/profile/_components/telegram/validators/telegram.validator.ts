"use server";

import db from "@/db";
import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";

export default async function telegramUniqueValidator(
  telegram: string,
): Promise<string | void> {
  try {
    const auth = getAuth();

    await validateUser(auth);

    const payload = await auth.getPayload();

    await validateJabber(payload.id, telegram);
  } catch (error) {
    if (error instanceof UnloggingError) {
      return error.message;
    }

    console.trace(error);
    return "Internal server error.";
  }
}

async function validateUser(auth: ReturnType<typeof getAuth>) {
  if (!(await auth.verify([]))) {
    throw new UnloggingError("You are not logged in.");
  }
}

async function validateJabber(userId: number, telegram: string) {
  const oldTelegram = await db.query.UserModel.findFirst({
    where: (model, { eq }) => eq(model.id, userId),
    columns: { telegram: true },
  });

  if (!oldTelegram) {
    throw new Error("User not found.");
  }

  if (oldTelegram.telegram === telegram) {
    throw new UnloggingError("Telegram can't be the same");
  }

  const user = await db.query.UserModel.findFirst({
    where: (model, { eq }) => eq(model.telegram, telegram),
    columns: { id: true },
  });

  if (!!user) {
    throw new UnloggingError("Telegram is already in use.");
  }
}
