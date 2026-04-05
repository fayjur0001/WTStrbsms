"use server";

import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import { z } from "zod";
import serviceIdExistsValidator from "../../../../../validators/service-id-exists.validator";
import db from "@/db";
import { MDNMessageModel } from "@/db/schema";
import { sql } from "drizzle-orm";

type Message = {
  id: number;
  date: string;
  from: string;
  to: string;
  reply: string;
  pin: string | null;
};

export default async function getMessagesAction(
  data: unknown,
): Promise<ResponseWraper<{ messages: Message[] }>> {
  try {
    const auth = getAuth();
    await validateUser(auth);

    const id = await parseData(data);

    const messages = await getMessages(id);

    return { success: true, messages };
  } catch (e) {
    if (e instanceof UnloggingError)
      return { success: false, message: e.message };

    console.trace(e);
    return { success: false, message: "Internal server error." };
  }
}

async function getMessages(id: number): Promise<Message[]> {
  const service = await db.query.LongTermRentsModel.findFirst({
    columns: { requestId: true },
    where: (model, { eq, and, inArray }) =>
      and(
        eq(model.id, id),
        inArray(model.status, [
          "Reserved",
          "Awaiting MDN",
          "Active",
          "Expired",
        ]),
      ),
  });

  if (!service) return [];

  const messages = await db.query.MDNMessageModel.findMany({
    where: (model, { eq, and }) =>
      and(eq(model.requestId, service.requestId), eq(model.type, "long_term")),
    columns: { id: true, from: true, to: true, reply: true, pin: true },
    extras: { date: sql<string>`${MDNMessageModel.timestamp}`.as("date") },
  });

  return messages;
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
        const message = await serviceIdExistsValidator(id);

        if (!!message) return ctx.addIssue({ message, code: "custom" });
      })
      .parseAsync(data);
  } catch {
    throw new UnloggingError("Invalid request.");
  }
}
