"use server";

import getAuth from "@/lib/utils/auth";
import serverAction from "@/lib/utils/server-action";
import UnloggingError from "@/lib/utils/unlogging-error";
import schema from "../schemas/buy.schema";
import remoteDevicesUrl from "@/lib/utils/remote-devices-url";
import getDevicesToken from "@/lib/utils/devices/get-token";
import deleteDevicesToken from "@/lib/utils/devices/delete-token";
import getBalance from "@/lib/utils/get-balance";
import SiteOptions from "@/lib/utils/site-options";
import db from "@/db";
import { DeviceTransactionModel } from "@/db/schema";
import pusher from "@/lib/utils/pusher";

export default async function buyAction(data: unknown) {
  return serverAction(async () => {
    const payload = await validateUser();

    const { line, mode, note } = parse(data);

    await buy({
      line,
      mode,
      note,
      userId: payload.id,
    });

    await refresh(payload.id);
  });
}

async function validateUser() {
  const auth = getAuth();

  if (!(await auth.verify([]))) throw new UnloggingError("Unauthorized.");

  return auth.getPayload();
}

function parse(data: unknown) {
  try {
    return schema.parse(data);
  } catch {
    throw new UnloggingError("Bad request.");
  }
}

async function buy({
  line,
  mode,
  userId,
  note,
}: ReturnType<typeof parse> & { userId: number }) {
  const balance = await getBalance(userId);

  const token = await getDevicesToken();

  try {
    const price = await calculatePrice({ line, mode, token });

    if (balance < price) throw new UnloggingError("Insufficient balance.");

    const url = new URL(`${remoteDevicesUrl}/api/lines/request/purchase-line`);

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    const body = {
      line,
      duration: mode === "day" ? "1" : mode === "week" ? "7" : "30",
      note,
    };

    const res: { success: false; message: string } | { success: true } =
      await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      }).then((r) => r.json());

    if (!res.success) throw new UnloggingError("Bad request.");

    const expiresAt = await getExpireAtDate(line, token);

    await db.insert(DeviceTransactionModel).values({
      line,
      price,
      expiresAt,
      userId,
    });

    await deleteDevicesToken(token);
  } catch (e) {
    await deleteDevicesToken(token);
    throw e;
  }
}

async function calculatePrice({
  token,
  line,
  mode,
}: {
  line: string;
  mode: "day" | "week" | "month";
  token: string;
}): Promise<number> {
  const priceUrl = `${remoteDevicesUrl}/api/rates/remote_mobile_rates_list`;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const priceRes:
    | { success: false }
    | { success: true; data: { day: string; week: string; month: string }[] } =
    await fetch(priceUrl, {
      method: "POST",
      headers,
    }).then((response) => response.json());

  const devicesUrl = `${remoteDevicesUrl}/api/lines/status/available`;

  const devicesRes:
    | { success: false }
    | {
        success: true;
        data: { Line: number; ["Service Provider"]: number }[];
      } = await fetch(devicesUrl, {
    method: "POST",
    headers,
  }).then((response) => response.json());

  if (!priceRes.success || !devicesRes.success) throw new Error("Bad request.");

  const currDevice = devicesRes.data.find(
    (device) => String(device.Line) === String(line),
  );

  if (!currDevice) throw new Error("Bad request.");

  const currPrice = priceRes.data[currDevice["Service Provider"]];

  let price = Number(currPrice[mode].replace(/^\$/, ""));

  const cut =
    mode === "day"
      ? await SiteOptions.transactionCut.Device.day.get()
      : mode === "week"
        ? await SiteOptions.transactionCut.Device.week.get()
        : await SiteOptions.transactionCut.Device.month.get();

  price = price + (price * cut) / 100;

  return price;
}

async function getExpireAtDate(line: string, token: string): Promise<Date> {
  const url = `${remoteDevicesUrl}/api/lines/status/assigned`;

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const res:
    | { success: false }
    | { success: true; data: { Line: number; ["Expire Date"]: string }[] } =
    await fetch(url, {
      method: "POST",
      headers,
    }).then((response) => response.json());

  if (!res.success) throw new Error("Bad request.");

  const device = res.data.find((dev) => String(dev.Line) === String(line));

  if (!device) throw new Error("Bad request.");

  return new Date(device["Expire Date"]);
}

async function refresh(userId: number) {
  await pusher({
    page: "/tools/remote-devices/available",
    to: `user-${userId}`,
  });
}
