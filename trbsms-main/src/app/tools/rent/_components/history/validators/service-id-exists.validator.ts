"use server";

import db from "@/db";
import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";

export default async function serviceIdExistsValidator(
  id: number,
): Promise<string | void> {
  try {
    const auth = getAuth();
    await validateUser(auth);

    const payload = await auth.getPayload();

    await serviceIdExists(payload.id, id);
  } catch (e) {
    if (e instanceof UnloggingError) return e.message;

    console.trace(e);

    return "Internal server error";
  }
}

async function validateUser(auth: ReturnType<typeof getAuth>) {
  if (!(await auth.verify([]))) throw new UnloggingError("Unauthorized.");
}

async function serviceIdExists(userId: number, id: number) {
  const service = await db.query.LongTermRentsModel.findFirst({
    where: (model, { eq, and }) =>
      and(eq(model.userId, userId), eq(model.id, id)),
    columns: { id: true },
  });

  if (!service) throw new UnloggingError("Service not found.");
}
