"use server";

import db from "@/db";
import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";

export default async function emailUniqueValidator(
  email: string,
): Promise<string | void> {
  try {
    const auth = getAuth();

    await validateUser(auth);

    const payload = await auth.getPayload();

    await checkEmail(email, payload.id);
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

async function checkEmail(email: string, currentUserId: number) {
  const oldEmail = await db.query.UserModel.findFirst({
    where: (model, { eq }) => eq(model.id, currentUserId),
    columns: { email: true },
  });

  if (!oldEmail) {
    throw new Error("User not found.");
  }

  if (oldEmail.email === email) {
    throw new UnloggingError("Email can't be the same.");
  }

  const user = await db.query.UserModel.findFirst({
    where: (model, { eq, and, ne }) =>
      and(eq(model.email, email), ne(model.id, currentUserId)),
    columns: { id: true },
  });

  if (!!user) {
    throw new UnloggingError("Email already exists.");
  }
}
