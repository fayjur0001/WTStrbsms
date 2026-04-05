"use server";

import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import { z } from "zod";
import ticketIdExistsValidator from "../../validators/ticket-id-exists.validator";
import db from "@/db";

export default async function getSubjectAction(
  uData: unknown,
): Promise<ResponseWraper<{ subject: string }>> {
  try {
    const auth = getAuth();

    await validateUser(auth);

    const ticketId = await parseData(uData);

    const subject = await getSubject(ticketId);

    return { success: true, subject };
  } catch (e) {
    if (e instanceof UnloggingError)
      return { success: false, message: e.message };

    console.trace(e);
    return { success: false, message: "Internal server error." };
  }
}

async function getSubject(ticketId: number) {
  const subject: string | undefined = await db.query.TicketModel.findFirst({
    where: (model, { eq }) => eq(model.id, ticketId),
    columns: { subject: true },
  }).then((r) => r?.subject);

  if (!subject) throw new UnloggingError("Ticket not found.");

  return subject;
}

async function validateUser(auth: ReturnType<typeof getAuth>) {
  if (!(await auth.verify([]))) throw new UnloggingError("Unauthorized.");
}

async function parseData(data: unknown) {
  try {
    return await z.coerce
      .number()
      .min(1)
      .superRefine(async (id, ctx) => {
        const message = await ticketIdExistsValidator(id);

        if (!!message) return ctx.addIssue({ message, code: "custom" });
      })
      .parseAsync(data);
  } catch {
    throw new UnloggingError("Invalid request.");
  }
}
