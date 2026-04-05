"use server";

import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import schema from "../schemas/tos.schema";
import SiteOptions from "@/lib/utils/site-options";

export default async function setTOSAction(
  data: unknown,
): Promise<ResponseWraper<unknown>> {
  try {
    await validateUser();
    const { tos } = await parse(data);
    await setTOS(tos);

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

async function parse(data: unknown) {
  try {
    return schema.parse(data);
  } catch {
    throw new UnloggingError("Invalid request.");
  }
}

async function setTOS(tos: string) {
  await SiteOptions.tos.set(tos);
}
