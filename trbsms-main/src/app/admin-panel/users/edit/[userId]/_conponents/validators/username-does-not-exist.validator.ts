"use server";

import db from "@/db";
import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";

export default async function usernameDoesNotExistValidator(
  id: number,
  username: string,
): Promise<string | void> {
  try {
    await validateUser();

    await usernameDoesNotExist(id, username);
  } catch (e) {
    if (e instanceof UnloggingError) return e.message;

    console.trace(e);
    return "Internal server error.";
  }
}

async function validateUser() {
  const auth = getAuth();

  if (!(await auth.verify(["admin", "super admin"])))
    throw new UnloggingError("Unauthorized.");
}

async function usernameDoesNotExist(id: number, username: string) {
  const user = await db.query.UserModel.findFirst({
    where: (model, { eq, ne, and }) =>
      and(ne(model.id, id), eq(model.username, username)),
    columns: {
      id: true,
    },
  });

  if (!!user) throw new UnloggingError("Username already exists.");
}
