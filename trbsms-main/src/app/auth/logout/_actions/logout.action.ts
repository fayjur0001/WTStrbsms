"use server";

import db from "@/db";
import { UserDeviceModel } from "@/db/schema";
import getAuth from "@/lib/utils/auth";
import ResponseWraper from "@/types/response-wraper.type";
import { eq } from "drizzle-orm";

export default async function logoutAction(): Promise<ResponseWraper> {
  try {
    const auth = getAuth();

    if (!(await auth.verify([]))) {
      await auth.removeToken();
      return {
        success: true,
      };
    }

    const token = await auth.getToken();

    if (!token) {
      await auth.removeToken();
      return {
        success: true,
      };
    }

    await db.delete(UserDeviceModel).where(eq(UserDeviceModel.token, token));

    await auth.removeToken();

    return {
      success: true,
    };
  } catch (error) {
    console.trace(error);
    return {
      success: false,
      message: "Internal Server Error.",
    };
  }
}
