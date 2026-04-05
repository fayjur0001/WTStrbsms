"use server";

import db from "@/db";
import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";

export default async function emailDoesNotExistValidator(
  id: number,
  email: string,
): Promise<string | void> {
  try {
    await validateUser();

    await emailDoesNotExist(id, email);
  } catch (e) {
    if (e instanceof Error) return e.message;

    console.trace(e);
    return "Internal server error.";
  }
}

async function validateUser() {
  const auth = getAuth();

  if (!(await auth.verify(["admin", "super admin"])))
    throw new UnloggingError("Unauthorized.");
}

async function emailDoesNotExist(id: number, email: string) {
  const user = await db.query.UserModel.findFirst({
    where: (model, { eq, ne, and }) =>
      and(eq(model.email, email), ne(model.id, id)),
  });

  if (!!user) throw new UnloggingError("Email already exists.");
}
