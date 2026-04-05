"use server";

import db from "@/db";
import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";

export default async function userIdExistsValidator(
  id: number,
): Promise<string | void> {
  try {
    await validateUser();
    await validateUserId(id);
  } catch (e) {
    if (e instanceof UnloggingError) return e.message;

    console.trace(e);

    return "Internal server error.";
  }
}

async function validateUser() {
  const auth = getAuth();

  if (!(await auth.verify(["admin", "super admin"]))) {
    throw new UnloggingError("Unauthorized.");
  }
}

async function validateUserId(id: number) {
  const user = await db.query.UserModel.findFirst({
    where: (model, { eq }) => eq(model.id, id),
    columns: { id: true },
  });

  if (!user) throw new UnloggingError("User id not found.");
}
