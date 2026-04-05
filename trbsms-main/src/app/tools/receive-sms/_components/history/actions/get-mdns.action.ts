"use server";

import db from "@/db";
import { MDNMessageModel, OneTimeRentModel, UserModel } from "@/db/schema";
import apiUrl from "@/lib/utils/api-url";
import getAuth from "@/lib/utils/auth";
import SiteOptions from "@/lib/utils/site-options";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import getFilterSchema from "../schemas/filter.schema";

export type Mdn = {
  id: number;
  requestId: string;
  username: string;
  date: Date;
  service: string;
  mdn: string;
  price: number;
  status: (typeof OneTimeRentModel.status.enumValues)[number];
  message: string | null;
  pin: string | null;
  limit: number;
};

export default async function getMdnsAction(
  data: unknown,
): Promise<ResponseWraper<{ mdns: Mdn[]; totalPages: number }>> {
  try {
    const auth = getAuth();
    await validateUser(auth);

    const { page, limit, filter } = parseData(data);

    const payload = await auth.getPayload();

    const { mdns, totalPages } = await getMdns({
      page,
      limit,
      userId: payload.id,
      filter,
    });

    return {
      success: true,
      mdns,
      totalPages,
    };
  } catch (e) {
    if (e instanceof UnloggingError)
      return { success: false, message: e.message };

    console.trace(e);
    return { success: false, message: "Internal server error." };
  }
}

async function validateUser(auth: ReturnType<typeof getAuth>) {
  if (!(await auth.verify([]))) throw new UnloggingError("Unauthorized.");
}

function parseData(data: unknown) {
  try {
    return z
      .object({
        page: z.coerce.number().min(1).optional().default(1),
        limit: z.coerce.number().min(1).optional().default(20),
        filter: getFilterSchema(["All", ...OneTimeRentModel.status.enumValues]),
      })
      .parse(data);
  } catch {
    throw new UnloggingError("Invalid request.");
  }
}

async function getMdns({
  userId,
  limit,
  page,
  filter,
}: ReturnType<typeof parseData> & { userId: number }): Promise<{
  mdns: Mdn[];
  totalPages: number;
}> {
  const user = await SiteOptions.apiUser.get();
  const apiKey = await SiteOptions.apiKey.get();

  //sync
  const forSync = await db
    .select({
      requestId: OneTimeRentModel.requestId,
      id: OneTimeRentModel.id,
      status: OneTimeRentModel.status,
    })
    .from(OneTimeRentModel)
    .where(
      and(
        eq(OneTimeRentModel.userId, userId),
        inArray(OneTimeRentModel.status, [
          "Reserved",
          "Awaiting MDN",
          "Active",
        ]),
      ),
    );

  await Promise.all(
    forSync.map(async (mdn) => {
      const url = new URL(apiUrl);
      url.searchParams.set("cmd", "request_status");
      url.searchParams.set("user", user);
      url.searchParams.set("api_key", apiKey);
      url.searchParams.set("id", mdn.requestId);

      const r:
        | { status: "error"; message: string }
        | {
            status: "ok";
            message: {
              status: (typeof OneTimeRentModel.status.enumValues)[number];
              message: string;
            };
          } = await fetch(url).then((r) => r.json());

      if (r.status === "error") return mdn;

      if (r.message.status !== mdn.status) {
        mdn.status = r.message.status;
        await db
          .update(OneTimeRentModel)
          .set({ status: r.message.status })
          .where(eq(OneTimeRentModel.id, mdn.id));
      }

      return mdn;
    }),
  );

  const mdnQuery = db
    .select({
      id: OneTimeRentModel.id,
      requestId: OneTimeRentModel.requestId,
      username: UserModel.username,
      date: OneTimeRentModel.createdAt,
      service: OneTimeRentModel.service,
      mdn: OneTimeRentModel.mdn,
      price: OneTimeRentModel.price,
      status: OneTimeRentModel.status,
      message: sql<
        string | null
      >`(array_agg(${MDNMessageModel.reply} order by ${MDNMessageModel.timestamp}, ${MDNMessageModel.createdAt} desc))[1]`.as(
        "message",
      ),
      pin: sql<string | null>`(array_agg(${MDNMessageModel.pin}))[1]`.as("pin"),
      limit: sql<number>`${OneTimeRentModel.tillExpiration} * 1000`.as("limit"),
    })
    .from(OneTimeRentModel)
    .innerJoin(UserModel, eq(UserModel.id, OneTimeRentModel.userId))
    .leftJoin(
      MDNMessageModel,
      and(
        eq(MDNMessageModel.requestId, OneTimeRentModel.requestId),
        eq(MDNMessageModel.type, "one_time"),
      ),
    )
    .orderBy(desc(OneTimeRentModel.createdAt))
    .where(
      and(
        eq(OneTimeRentModel.userId, userId),
        sql`regexp_like(${OneTimeRentModel.service}, ${filter.service}, 'i')`,
        sql`regexp_like(${OneTimeRentModel.mdn}, ${filter.mdn}, 'i')`,
        filter.status === "All"
          ? undefined
          : eq(
              OneTimeRentModel.status,
              filter.status as (typeof OneTimeRentModel.status.enumValues)[number],
            ),
      ),
    )
    .groupBy(OneTimeRentModel.id, UserModel.id)
    .as("mdnQuery");

  const offset = (page - 1) * limit;

  const [mdns, totalPages] = await Promise.all([
    db
      .select()
      .from(mdnQuery)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(mdnQuery.date)),
    db
      .select({ total: sql<number>`COUNT(*)` })
      .from(mdnQuery)
      .then((r) => Math.ceil((r.at(0)?.total || 0) / limit)),
  ]);

  return { mdns, totalPages };
}
