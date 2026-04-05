"use server";

import db from "@/db";
import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";

export default async function jabberDoesNotExistValidator(
  id: number,
  jabber: string,
): Promise<string | void> {
  try {
    await validateUser();
    await jabberDoesNotExist(id, jabber);
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

async function jabberDoesNotExist(id: number, jabber: string) {
  const user = await db.query.UserModel.findFirst({
    where: (model, { eq, and, ne }) =>
      and(ne(model.id, id), eq(model.jabber, jabber)),
    columns: { id: true },
  });

  if (!!user) throw new UnloggingError("Jabber already exists.");
}
