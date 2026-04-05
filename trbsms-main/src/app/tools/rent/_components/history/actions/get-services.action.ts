"use server";

import db from "@/db";
import { LongTermRentsModel, MDNMessageModel, UserModel } from "@/db/schema";
import apiUrl from "@/lib/utils/api-url";
import getAuth from "@/lib/utils/auth";
import SiteOptions from "@/lib/utils/site-options";
import UnloggingError from "@/lib/utils/unlogging-error";
import ResponseWraper from "@/types/response-wraper.type";
import { and, desc, eq, gte, notInArray, sql } from "drizzle-orm";
import { z } from "zod";
import getSchema from "../schemas/filter.schema";

type Service = {
  id: number;
  username: string;
  purchasedDate: Date;
  expireDate: Date;
  lastIncoming: string;
  service: string;
  mdn: string;
  price: number;
  onlineStatus: (typeof LongTermRentsModel.onlineStatus.enumValues)[number];
  status: (typeof LongTermRentsModel.status.enumValues)[number];
};

export default async function getServicesAction(
  data: unknown,
): Promise<ResponseWraper<{ services: Service[]; totalPage: number }>> {
  try {
    const auth = getAuth();
    await validateUser(auth);

    const { limit, page, filter } = parseData(data);

    const payload = await auth.getPayload();

    const { services, totalPage } = await getServices({
      userId: payload.id,
      limit,
      page,
      filter,
    });

    return { success: true, services, totalPage };
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

async function getServices({
  userId,
  limit,
  page,
  filter,
}: {
  userId: number;
  limit: number;
  page: number;
  filter: ReturnType<typeof parseData>["filter"];
}): Promise<{ services: Service[]; totalPage: number }> {
  await syncServices(userId);

  const incomingInterval = sql<string>`(current_timestamp - (array_agg(${MDNMessageModel.timestamp} order by ${MDNMessageModel.timestamp}, ${MDNMessageModel.id} desc))[1])::interval`;
  const serviceQuery = db
    .select({
      id: LongTermRentsModel.id,
      username: UserModel.username,
      purchasedDate: LongTermRentsModel.createdAt,
      expireDate: LongTermRentsModel.expirationDate,
      lastIncoming: sql<string>`case
        when extract(day from ${incomingInterval})::int > 0
        then 'Over 24 hours'
        when extract(hour from ${incomingInterval})::int > 0
        then extract(hour from ${incomingInterval})::int || ' hours ' || extract(minute from ${incomingInterval})::int || ' minutes'
        else extract(minute from ${incomingInterval})::int || ' minutes'
      end`.as("last_invoming"),
      service: sql<string>`${LongTermRentsModel.service} ||
        case
          when ${LongTermRentsModel.rentType} = 'short'
          then ', 3 days'
          else ', 30 days'
        end
      `.as("service"),
      mdn: LongTermRentsModel.mdn,
      price: LongTermRentsModel.price,
      onlineStatus: LongTermRentsModel.onlineStatus,
      status: LongTermRentsModel.status,
    })
    .from(LongTermRentsModel)
    .innerJoin(UserModel, eq(UserModel.id, LongTermRentsModel.userId))
    .leftJoin(
      MDNMessageModel,
      eq(MDNMessageModel.requestId, LongTermRentsModel.requestId),
    )
    .where(
      and(
        eq(LongTermRentsModel.userId, userId),
        filter.status === "All"
          ? undefined
          : eq(
              LongTermRentsModel.status,
              filter.status as (typeof LongTermRentsModel.status.enumValues)[number],
            ),
        filter.onlineStatus === "All"
          ? undefined
          : eq(
              LongTermRentsModel.onlineStatus,
              filter.onlineStatus as (typeof LongTermRentsModel.onlineStatus.enumValues)[number],
            ),
        sql`regexp_like(${LongTermRentsModel.service}, ${filter.service}, 'i')`,
        sql`regexp_like(${LongTermRentsModel.mdn}, ${filter.mdn}, 'i')`,
      ),
    )
    .groupBy(LongTermRentsModel.id, UserModel.id)
    .as("services");

  const offset = (page - 1) * limit;
  const [services, totalPage] = await Promise.all([
    db
      .select()
      .from(serviceQuery)
      .orderBy(desc(serviceQuery.purchasedDate))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: sql<number>`count(*)` })
      .from(serviceQuery)
      .then((r) => Math.ceil((r.at(0)?.total || 0) / limit)),
  ]);

  return { services, totalPage };
}

async function syncServices(userId: number) {
  await db
    .update(LongTermRentsModel)
    .set({ status: "Expired" })
    .where(
      and(
        gte(LongTermRentsModel.createdAt, LongTermRentsModel.expirationDate),
        notInArray(LongTermRentsModel.status, ["Expired", "Rejected"]),
      ),
    );

  const services = await db.query.LongTermRentsModel.findMany({
    where: (model, { eq, and, inArray }) =>
      and(
        eq(model.userId, userId),
        inArray(model.status, ["Reserved", "Awaiting MDN", "Active"]),
      ),
    columns: { requestId: true, id: true },
  });

  const user = await SiteOptions.apiUser.get();
  const apiKey = await SiteOptions.apiKey.get();

  const url = new URL(apiUrl);
  url.searchParams.set("cmd", "ltr_status");
  url.searchParams.set("user", user);
  url.searchParams.set("api_key", apiKey);

  await Promise.all(
    services.map(async ({ requestId, id }) => {
      url.searchParams.set("ltr_id", requestId);

      const res:
        | {
            status: "ok";
            message: {
              ltr_status: (typeof LongTermRentsModel.onlineStatus.enumValues)[number];
            };
          }
        | {
            status: "error";
            message: string;
          } = await fetch(url).then((r) => r.json());

      if (
        res.status === "error" &&
        res.message === "Invalid or expired rental"
      ) {
        await db
          .update(LongTermRentsModel)
          .set({ status: "Expired", onlineStatus: "offline" })
          .where(eq(LongTermRentsModel.id, id));
        return;
      }

      if (res.status === "error") throw new UnloggingError(res.message);

      await db
        .update(LongTermRentsModel)
        .set({
          onlineStatus: res.message.ltr_status,
        })
        .where(eq(LongTermRentsModel.id, id));
    }),
  );
}

function parseData(data: unknown) {
  try {
    return z
      .object({
        page: z.number().optional().default(1),
        limit: z.number().optional().default(20),
        filter: getSchema(
          ["All", ...LongTermRentsModel.onlineStatus.enumValues],
          ["All", ...LongTermRentsModel.status.enumValues],
        ),
      })
      .parse(data);
  } catch {
    throw new UnloggingError("Invalid request.");
  }
}
