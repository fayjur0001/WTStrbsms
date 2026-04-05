"use server";

import db from "@/db";
import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";

export default async function emailUniqueValidator(
  email: string,
): Promise<string | void> {
  try {
    await validateUser();
    await validateEmail(email);
  } catch (e) {
    if (e instanceof UnloggingError) {
      return e.message;
    }

    console.trace(e);
    return "Internal Server Error";
  }
}

async function validateUser() {
  const auth = getAuth();

  if (!(await auth.verify())) {
    throw new UnloggingError("Unauthorized");
  }
}

async function validateEmail(email: string) {
  const user = await db.query.UserModel.findFirst({
    where: (model, { eq }) => eq(model.email, email),
  });

  if (!!user) {
    throw new UnloggingError("Email is already taken.");
  }
}
