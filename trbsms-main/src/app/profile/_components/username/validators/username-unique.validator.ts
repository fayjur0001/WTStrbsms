"use server";

import db from "@/db";
import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";

export default async function usernameUniqueValidator(
  username: string,
): Promise<string | void> {
  try {
    const auth = getAuth();

    await validateUser(auth);
    await validateUsername(auth, username);
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
    throw new UnloggingError("Unauthorized.");
  }
}

async function validateUsername(
  auth: ReturnType<typeof getAuth>,
  username: string,
) {
  const payload = await auth.getPayload();

  if (payload.username === username) {
    throw new UnloggingError("Username can't be the same.");
  }

  const user = await db.query.UserModel.findFirst({
    where: (model, { eq, and, ne }) =>
      and(eq(model.username, username), ne(model.id, payload.id)),
    columns: { id: true },
  });

  if (!!user) {
    throw new UnloggingError("Username already exists.");
  }
}
