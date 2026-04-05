"use server";

import db from "@/db";
import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";

export default async function idExistsValidator(
  id: number,
): Promise<string | void> {
  try {
    const auth = getAuth();

    if (!(await auth.verify([]))) throw new UnloggingError("Unauthorized.");

    const payload = await auth.getPayload();

    const service: { id: number } | undefined =
      await db.query.LongTermRentsModel.findFirst({
        where: (model, { eq, and }) =>
          and(eq(model.id, id), eq(model.userId, payload.id)),
        columns: { id: true },
      });

    if (!service) return "Service not found.";
  } catch (e) {
    if (e instanceof UnloggingError) return e.message;

    console.trace(e);
    return "Internal server error.";
  }
}
