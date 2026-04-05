"use server";

import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import { z } from "zod";
import loginDataSchema from "../schemas/login.schema";
import Payload from "@/types/payload.type";
import db from "@/db";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import { UserDeviceModel } from "@/db/schema";

export default async function loginAction(
  uData: unknown,
): Promise<
  ResponseWraper<{ token: string }, keyof z.infer<typeof loginDataSchema>>
> {
  try {
    const auth = getAuth();

    await validateUser(auth);
    const data = parseUser(uData);
    const payload = await getPayload(data.data, data.staff);
    const token = await grantAccess({
      payload,
      auth,
      rememberMe: data.data.rememberMe === "true",
    });

    return {
      success: true,
      token,
    };
  } catch (error) {
    if (error instanceof FieldError) {
      return {
        success: false,
        message: error.message,
        field: error.field,
      };
    }

    if (error instanceof UnloggingError) {
      return {
        success: false,
        message: error.message,
      };
    }

    console.trace(error);
    return {
      success: false,
      message: "Internal Server Error.",
    };
  }
}

async function validateUser(auth: ReturnType<typeof getAuth>) {
  if (!(await auth.verify())) {
    throw new UnloggingError("Unauthorized.");
  }
}

function parseUser(data: unknown) {
  return z
    .object({
      data: loginDataSchema,
      staff: z.boolean().default(false),
    })
    .parse(data);
}

async function getPayload(
  data: z.infer<typeof loginDataSchema>,
  staff: boolean,
): Promise<Payload> {
  const user = await db.query.UserModel.findFirst({
    where: (model, { eq, or, and, inArray }) =>
      and(
        or(eq(model.username, data.username), eq(model.email, data.username)),
        inArray(
          model.role,
          staff ? ["admin", "super admin", "support"] : ["general"],
        ),
      ),
    columns: {
      id: true,
      role: true,
      username: true,
      password: true,
      banned: true,
      bannedTill: true,
      pinCode: true,
    },
    extras: { isShadowAdmin: sql<boolean>`false`.as("isShadowAdmin") },
  });

  if (!user) {
    throw new FieldError("Invalid username or email.", "username");
  }

  const { password, ...payload } = user;

  if (!bcrypt.compareSync(data.password, password)) {
    throw new FieldError("Invalid password.", "password");
  }

  if (!!user.pinCode || !!data.pinCode) {
    if (!bcrypt.compareSync(data.pinCode || "", user.pinCode || "")) {
      throw new FieldError("Invalid pin code.", "pinCode");
    }
  }

  if (user.banned) {
    throw new UnloggingError("Your account has been banned.");
  }

  const date = new Date();

  if (user.bannedTill && user.bannedTill > date) {
    throw new UnloggingError(
      `Your account has been temporarily banned. You will be able to login in ${Math.ceil((user.bannedTill.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))} days.`,
    );
  }

  return payload;
}

class FieldError<Field> extends Error {
  constructor(
    message: string,
    public field: Field,
  ) {
    super(message);
  }
}

async function grantAccess({
  auth,
  payload,
  rememberMe,
}: {
  payload: Payload;
  auth: ReturnType<typeof getAuth>;
  rememberMe: boolean;
}) {
  const token = await auth.setToken(payload, rememberMe ? 365 : 0);

  const device = await db.query.UserDeviceModel.findFirst({
    where: (model, { eq }) => eq(model.token, token),
    columns: { id: true },
  });

  if (!!device) {
    new UnloggingError("You are already logged in.");
  }

  await db.insert(UserDeviceModel).values({
    token,
    userId: payload.id,
  });

  return token;
}
