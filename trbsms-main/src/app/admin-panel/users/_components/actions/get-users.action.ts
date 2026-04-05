"use server";

import db from "@/db";
import { UserModel } from "@/db/schema";
import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import { and, desc, eq, gte, ne, or, sql } from "drizzle-orm";
import { z } from "zod";
import getFilterSchema from "../schemas/filter.schema";
import Role from "@/types/role.type";

export type User = {
  id: number;
  username: string;
  email: string;
  role: (typeof UserModel.role.enumValues)[number];
  activity: Date;
  isOnline: boolean;
  banned: boolean;
};

export default async function getUsersAction(
  data: unknown,
): Promise<ResponseWraper<{ users: User[]; totalPages: number }>> {
  try {
    const auth = getAuth();
    await validateUser(auth);

    const { page, limit, filter } = parseData(data);

    const payload = await auth.getPayload();

    const { users, totalPages } = await getUsers({
      page,
      limit,
      userId: payload.id,
      filter,
    });

    return { success: true, totalPages, users };
  } catch (e) {
    if (e instanceof UnloggingError)
      return { success: false, message: e.message };

    console.trace(e);

    return { success: false, message: "Internal server error." };
  }
}

async function validateUser(auth: ReturnType<typeof getAuth>) {
  if (!(await auth.verify(["admin", "super admin"])))
    throw new UnloggingError("Unauthorized.");
}

function parseData(data: unknown) {
  try {
    return z
      .object({
        page: z.coerce.number().min(1).optional().default(1),
        limit: z.coerce.number().min(1).optional().default(20),
        filter: getFilterSchema(["all", ...UserModel.role.enumValues] as [
          string,
          ...string[],
        ]),
      })
      .parse(data);
  } catch {
    throw new UnloggingError("Invalid request.");
  }
}

async function getUsers({
  page,
  limit,
  userId,
  filter,
}: {
  page: number;
  limit: number;
  userId: number;
  filter: z.infer<ReturnType<typeof getFilterSchema>>;
}): Promise<{ users: User[]; totalPages: number }> {
  const usersQuery = db
    .select({
      id: UserModel.id,
      username: UserModel.username,
      email: UserModel.email,
      role: UserModel.role,
      isOnline: UserModel.isOnline,
      activity: UserModel.updatedAt,
      banned:
        sql<boolean>`case when ${UserModel.banned} then true else case when ${UserModel.bannedTill} > CURRENT_TIMESTAMP then true else false end end`.as(
          "banned",
        ),
    })
    .from(UserModel)
    .where(
      and(
        ne(UserModel.id, userId),
        ne(UserModel.role, "super admin"),
        !filter.username
          ? undefined
          : sql`regexp_like(${UserModel.username}, ${filter.username}, 'i')`,
        !filter.email
          ? undefined
          : sql`regexp_like(${UserModel.email}, ${filter.email}, 'i')`,
        filter.role === "all"
          ? undefined
          : eq(UserModel.role, filter.role as Role),
        filter.bannedOnly
          ? or(
              eq(UserModel.banned, true),
              gte(UserModel.bannedTill, new Date()),
            )
          : undefined,
        filter.onlineOnly ? eq(UserModel.isOnline, true) : undefined,
      ),
    )
    .as("users");

  const offset = (page - 1) * limit;

  const [users, totalPages] = await Promise.all([
    db
      .select()
      .from(usersQuery)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(usersQuery.id)),
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(usersQuery)
      .then((r) => Math.ceil((r.at(0)?.total || 0) / limit)),
  ]);

  return { users, totalPages };
}
