"use server";

import db from "@/db";
import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";

export default async function jabberUniqueValidator(
  jabber: string,
): Promise<string | void> {
  try {
    const auth = getAuth();

    await validateUser(auth);

    const payload = await auth.getPayload();

    await validateJabber(payload.id, jabber);
  } catch (error) {
    if (error instanceof Error) {
      return error.message;
    }

    console.trace(error);
    return "Internal Server Error.";
  }
}

async function validateUser(auth: ReturnType<typeof getAuth>) {
  if (!(await auth.verify([]))) {
    throw new Error("Unauthorized.");
  }
}

async function validateJabber(id: number, jabber: string) {
  const oldJabbar = await db.query.UserModel.findFirst({
    where: (model, { eq }) => eq(model.id, id),
    columns: { jabber: true },
  });

  if (!oldJabbar) {
    throw new Error("User not found.");
  }

  if (oldJabbar.jabber === jabber) {
    throw new UnloggingError("Jabber can't be the same.");
  }

  const user = await db.query.UserModel.findFirst({
    where: (model, { eq, and, ne }) =>
      and(eq(model.jabber, jabber), ne(model.id, id)),
    columns: { id: true },
  });

  if (!!user) {
    throw new UnloggingError("Jabber already in use.");
  }
}
