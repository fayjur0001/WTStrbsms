"use server";

import db from "@/db";
import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";

export default async function userIdValidator(
  userId: number,
): Promise<string | void> {
  try {
    const auth = getAuth();

    await validateUser(auth);

    const payload = await auth.getPayload();

    await validateUserId(userId, payload.id);
  } catch (e) {
    if (e instanceof UnloggingError) return e.message;

    console.trace(e);
    return "Internal server error.";
  }
}

async function validateUser(auth: ReturnType<typeof getAuth>) {
  if (!(await auth.verify(["admin", "super admin"])))
    throw new UnloggingError("Unauthorized.");
}

async function validateUserId(userId: number, ownId: number) {
  if (userId === ownId)
    throw new UnloggingError("You can't create a ticket for yourself.");

  const user: { id: number } | undefined = await db.query.UserModel.findFirst({
    where: (model, { eq }) => eq(model.id, userId),
    columns: { id: true },
  });

  if (!user) throw new UnloggingError("User not found.");
}
