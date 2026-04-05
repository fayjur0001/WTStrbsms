import db from "@/db";
import {
  AddedFundModel,
  DeviceTransactionModel,
  LongTermRentsModel,
  OneTimeRentModel,
  RentedProxyModel,
} from "@/db/schema";
import { sql, and, eq, inArray } from "drizzle-orm";

export default async function getBalance(userId: number) {
  const addedBalance: number = await db
    .select({ balance: sql<number>`SUM(${AddedFundModel.amount})::real` })
    .from(AddedFundModel)
    .where(
      and(
        eq(AddedFundModel.userId, userId),
        eq(AddedFundModel.status, "approved"),
      ),
    )
    .then((r) => r.at(0)?.balance || 0);

  const oneTimeRent: number = await db
    .select({ total: sql<number>`SUM(${OneTimeRentModel.price})::real` })
    .from(OneTimeRentModel)
    .where(
      and(
        eq(OneTimeRentModel.userId, userId),
        inArray(OneTimeRentModel.status, [
          "Awaiting MDN",
          "Completed",
          "Reserved",
        ]),
      ),
    )
    .then((r) => r.at(0)?.total || 0);

  const longTermRent: number = await db
    .select({
      total: sql<number>`SUM(${LongTermRentsModel.price})::real`,
    })
    .from(LongTermRentsModel)
    .where(
      and(
        eq(LongTermRentsModel.userId, userId),
        inArray(LongTermRentsModel.status, [
          "Reserved",
          "Active",
          "Awaiting MDN",
          "Expired",
          "Completed",
        ]),
      ),
    )
    .then((r) => r.at(0)?.total || 0);

  const rentedProxy: number = await db
    .select({ sum: sql<number>`SUM(${RentedProxyModel.price})::real` })
    .from(RentedProxyModel)
    .where(eq(RentedProxyModel.userId, userId))
    .then((r) => r.at(0)?.sum || 0);

  const remoteDevice: number = await db
    .select({
      sum: sql<number>`SUM(${DeviceTransactionModel.price})::real`,
    })
    .from(DeviceTransactionModel)
    .where(eq(DeviceTransactionModel.userId, userId))
    .then((r) => r.at(0)?.sum || 0);

  return addedBalance - oneTimeRent - longTermRent - rentedProxy - remoteDevice;
}
