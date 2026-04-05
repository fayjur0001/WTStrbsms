"use server";

import db from "@/db";
import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";

export default async function usernameUniqueValidator(
  username: string,
): Promise<string | void> {
  try {
    await validateUser();
    await validateUsername(username);
  } catch (e) {
    if (e instanceof UnloggingError) {
      return e.message;
    }

    console.trace(e);
    return "Internal Server Error";
  }
}

async function validateUsername(username: string) {
  const user = await db.query.UserModel.findFirst({
    where: (model, { eq }) => eq(model.username, username),
  });

  if (!!user) {
    throw new UnloggingError("Username is already taken.");
  }
}

async function validateUser() {
  const auth = getAuth();

  if (!(await auth.verify())) {
    throw new UnloggingError("Unauthorized");
  }
}
