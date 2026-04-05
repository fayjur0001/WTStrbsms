"use server";

import serverAction from "@/lib/utils/server-action";
import { Device } from "../../../page";
import getAuth from "@/lib/utils/auth";
import UnloggingError from "@/lib/utils/unlogging-error";
import remoteDevicesUrl from "@/lib/utils/remote-devices-url";
import getDevicesToken from "@/lib/utils/devices/get-token";
import deleteDevicesToken from "@/lib/utils/devices/delete-token";
import db from "@/db";

export default async function getAssignedDevicesAction() {
  return serverAction<{ devices: Device[] }>(async () => {
    const payload = await validateUser();

    const devices = await getDevices(payload.id);

    return { devices };
  });
}

async function validateUser() {
  const auth = getAuth();

  if (!(await auth.verify([]))) throw new UnloggingError("Unauthorized");

  return auth.getPayload();
}

async function getDevices(userId: number): Promise<Device[]> {
  const purchasedDevices = await db.query.DeviceTransactionModel.findMany({
    where: (model, { eq, and, gte }) =>
      and(eq(model.userId, userId), gte(model.expiresAt, new Date())),
    columns: { line: true, expiresAt: true },
  });

  const token = await getDevicesToken();

  const url = `${remoteDevicesUrl}/api/lines/status/assigned`;

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const res:
    | { success: false }
    | {
        success: true;
        data: {
          ["Device Location"]: string;
          ["Device Type"]: string;
          Architecture: number;
          Duration: number;
          ["Expire Date"]: string;
          ["Extra Date"]: number;
          ["Is Expire ?"]: unknown;
          ["Is Technical issue?"]: unknown;
          ["Is V2?"]: string | null;
          Line: number;
          Note: string | null;
          PC: string;
          ["RDP ID"]: string;
          Port: string;
          ["RDP Password"]: string;
          ["Reset URL"]: string;
          ["Service Provider Expire"]: string;
          ["Start Date"]: string;
          Speed: number;
          Status: string;
          ["Supremo ID"]: string;
          ["Supremo Pass"]: string;
          ["Operating System"]: number;
          ["Service Provider"]: number;
          ["Any Desk ID"]: string;
          ["Any Desk Pass"]: string;
        }[];
      } = await fetch(url, {
    method: "POST",
    headers,
  }).then((response) => response.json());

  const priceRes:
    | { success: false }
    | {
        success: true;
        data: {
          service: string;
          day: string;
          week: string;
          month: string;
        }[];
      } = await fetch(
    `${remoteDevicesUrl}/api/rates/remote_mobile_rates_list`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    },
  ).then((r) => r.json());

  await deleteDevicesToken(token);

  if (!res.success || !priceRes.success)
    throw new UnloggingError("Failed to get devices");

  const devices = res.data
    .filter(({ Line }) =>
      purchasedDevices.some((pd) => String(pd.line) === String(Line)),
    )
    .map(
      (device): Device => ({
        deviceLocation: device["Device Location"],
        deviceType: device["Device Type"],
        price: {
          day: 0,
          month: 0,
          week: 0,
        },
        architecture: device.Architecture === 0 ? "32-bit" : "64-bit",
        duration:
          device.Duration === 0
            ? "Daily"
            : device.Duration === 1
              ? "Weekly"
              : "Monthly",
        expireDate: device["Expire Date"],
        extraDate: device["Extra Date"],
        isExpire: device["Is Expire ?"],
        isTechnicalIssue: device["Is Technical issue?"],
        isV2: device["Is V2?"] || "",
        line: String(device.Line),
        note: device.Note || "",
        pc: device.PC,
        port: device.Port,
        rdpID: device["RDP ID"],
        rdpPassword: device["RDP Password"],
        resetUrl: device["Reset URL"],
        serviceProviderExpireDate: device["Service Provider Expire"],
        speed: device.Speed === 0 ? "4G" : "5G",
        startDate: device["Start Date"],
        status: device.Status,
        supremoId: device["Supremo ID"],
        supremoPass: device["Supremo Pass"],
        operatingSystem:
          device["Operating System"] === 1
            ? "Linux"
            : device["Operating System"] === 2
              ? "Mac OS"
              : "Windows 10",
        serviceProvider: priceRes.data[device["Service Provider"]].service,
        anyDeskId: device["Any Desk ID"],
        anyDeskPassword: device["Any Desk Pass"],
      }),
    );

  return devices;
}
