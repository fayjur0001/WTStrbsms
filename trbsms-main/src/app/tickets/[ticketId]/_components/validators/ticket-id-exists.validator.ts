"use server";

import db from "@/db";
import getAuth from "@/lib/utils/auth";

export default async function ticketIdExistsValidator(
  id: number,
): Promise<string | void> {
  const auth = getAuth();

  if (!(await auth.verify([]))) return "Unauthorized.";

  const payload = await auth.getPayload();

  const ticketExists = await db.query.TicketModel.findFirst({
    where: (model, { eq, and, or }) =>
      and(
        eq(model.id, id),
        payload.role !== "super admin"
          ? or(eq(model.userId, payload.id), eq(model.agentId, payload.id))
          : undefined,
      ),
    columns: { id: true },
  }).then(Boolean);

  if (!ticketExists) return "Ticket not found.";
}
