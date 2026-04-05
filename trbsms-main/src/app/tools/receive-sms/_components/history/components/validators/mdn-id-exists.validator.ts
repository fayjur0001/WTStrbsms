"use server";

import db from "@/db";
import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";

export default async function mdnIdExistsValidator(
  id: number,
): Promise<string | void> {
  try {
    const auth = getAuth();
    await validateUser(auth);

    const payload = await auth.getPayload();

    await mdnIdExists(id, payload.id);
  } catch (e) {
    if (e instanceof UnloggingError) return e.message;

    console.trace(e);
    return "Internal server error.";
  }
}

async function validateUser(auth: ReturnType<typeof getAuth>) {
  if (!(await auth.verify([]))) throw new UnloggingError("Unauthorized.");
}

async function mdnIdExists(id: number, userId: number) {
  const mdn: { id: number } | undefined =
    await db.query.OneTimeRentModel.findFirst({
      where: (model, { eq, and }) =>
        and(eq(model.id, id), eq(model.userId, userId)),
    });

  if (!mdn) throw new UnloggingError("Service not found.");
}
