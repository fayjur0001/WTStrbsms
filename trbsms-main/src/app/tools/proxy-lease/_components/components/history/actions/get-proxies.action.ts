"use server";

import db from "@/db";
import { RentedProxyModel } from "@/db/schema";
import getAuth from "@/lib/utils/auth";
import serverAction from "@/lib/utils/server-action";
import UnloggingError from "@/lib/utils/unlogging-error";
import { desc, eq, sql } from "drizzle-orm";
import { z } from "zod";

type Proxy = {
  id: number;
  port: string;
  proxyCarrier: string;
  proxyUser: string;
  proxyPass: string;
  proxyIp: string;
  proxySocksPort: number;
  proxyHttpPort: number;
  price: number;
  proxyType: (typeof RentedProxyModel.proxyType.enumValues)[number];
  isExpired: boolean;
};

export default async function getProxiesAction(data: unknown) {
  return serverAction<{ proxies: Proxy[]; totalPage: number }>(async () => {
    const payload = await validateUser();

    const { limit, offset } = parse(data);

    const { proxies, totalPage } = await getProxies({
      limit,
      offset,
      userId: payload.id,
    });

    return { proxies, totalPage };
  });
}

async function getProxies({
  limit,
  offset,
  userId,
}: {
  limit: number;
  offset: number;
  userId: number;
}) {
  const query = db
    .select({
      id: RentedProxyModel.id,
      port: RentedProxyModel.port,
      proxyCarrier: RentedProxyModel.proxyCarrier,
      proxyUser: RentedProxyModel.proxyUser,
      proxyPass: RentedProxyModel.proxyPass,
      proxyIp: RentedProxyModel.proxyIp,
      proxySocksPort: RentedProxyModel.proxySocksPort,
      proxyHttpPort: RentedProxyModel.proxyHttpPort,
      price: RentedProxyModel.price,
      proxyType: RentedProxyModel.proxyType,
      isExpired: sql<boolean>`(${RentedProxyModel.expirationDate} < now())`.as(
        "is_expired",
      ),
    })
    .from(RentedProxyModel)
    .where(eq(RentedProxyModel.userId, userId))
    .as("query");

  const [proxies, totalPage]: [Proxy[], number] = await Promise.all([
    db.select().from(query).limit(limit).offset(offset).orderBy(desc(query.id)),
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(query)
      .then((r) => Math.ceil((r.at(0)?.total || 0) / limit)),
  ]);

  return { proxies, totalPage };
}

function parse(data: unknown) {
  try {
    const { limit, page } = z
      .object({
        limit: z.coerce.number().min(1).optional().default(20),
        page: z.coerce.number().min(1).optional().default(1),
      })
      .parse(data);

    const offset = (page - 1) * limit;

    return { limit, offset };
  } catch {
    throw new UnloggingError("Bad request.");
  }
}

async function validateUser() {
  const auth = getAuth();

  if (!(await auth.verify([]))) throw new UnloggingError("Unauthorized.");

  return await auth.getPayload();
}
