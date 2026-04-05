"use server";

import db from "@/db";
import { TicketModel } from "@/db/schema";
import getAuth from "@/lib/utils/auth";
import pusher from "@/lib/utils/pusher";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import { eq } from "drizzle-orm";
import { z } from "zod";

export default async function claimAction(
  data: unknown,
): Promise<ResponseWraper<unknown>> {
  try {
    const auth = getAuth();
    await validateUser(auth);

    const ticketId = await parseData(data);

    const payload = await auth.getPayload();

    await claim(payload.id, ticketId);

    await refresh(payload.id);

    return { success: true };
  } catch (e) {
    if (e instanceof UnloggingError)
      return { success: false, message: e.message };

    console.trace(e);

    return {
      success: false,
      message: "Interal server error.",
    };
  }
}

async function validateUser(auth: ReturnType<typeof getAuth>) {
  if (!(await auth.verify(["admin", "super admin", "support"])))
    throw new UnloggingError("Unauthorized.");
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

async function ticketIdExistsValidator(id: number): Promise<string | void> {
  const ticket: { id: number } | undefined =
    await db.query.TicketModel.findFirst({
      where: (model, { eq, and, isNull }) =>
        and(eq(model.id, id), isNull(model.agentId)),
      columns: { id: true },
    });

  if (!ticket) return "Ticket not found.";
}

async function claim(agentId: number, ticketId: number) {
  await db
    .update(TicketModel)
    .set({ agentId })
    .where(eq(TicketModel.id, ticketId));
}

async function refresh(agentId: number) {
  await pusher({
    page: "/tickets/unclaimed-tickets/refresh",
    to: `user-${agentId}`,
  });
  await pusher({
    page: "/tickets/my-tickets/refresh",
    to: `user-${agentId}`,
  });

  await pusher({
    page: "/tickets/other",
    to: "admin",
  });
}
