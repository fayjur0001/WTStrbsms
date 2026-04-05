"use server";

import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import getSchema from "../schemas/edit.schema";
import db from "@/db";
import { eq } from "drizzle-orm";
import { UserModel } from "@/db/schema";
import pusher from "@/lib/utils/pusher";

export default async function editAction(
  data: unknown,
): Promise<ResponseWraper<unknown>> {
  try {
    await validateUser();
    const parsedData = await parseData(data);
    await edit(parsedData);

    await refresh();
    return { success: true };
  } catch (e) {
    if (e instanceof UnloggingError)
      return { success: false, message: e.message };

    console.trace(e);
    return { success: false, message: "Internal server error." };
  }
}

async function validateUser() {
  const auth = getAuth();

  if (!(await auth.verify(["admin", "super admin"])))
    throw new UnloggingError("Unauthorized.");
}

async function parseData(data: unknown) {
  try {
    return getSchema((data as { id: number }).id || 0).parseAsync(data);
  } catch {
    throw new UnloggingError("Invalid request.");
  }
}

async function edit(data: Awaited<ReturnType<typeof parseData>>) {
  await db.update(UserModel).set(data).where(eq(UserModel.id, data.id));
}

async function refresh() {
  await pusher({ page: "/admin-panel/users", to: "admin" });
}
