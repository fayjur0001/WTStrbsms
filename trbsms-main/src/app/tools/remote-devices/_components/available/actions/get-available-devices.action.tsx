"use server";

import serverAction from "@/lib/utils/server-action";
import { Device } from "../../../page";
import remoteDevicesUrl from "@/lib/utils/remote-devices-url";
import UnloggingError from "@/lib/utils/unlogging-error";
import SiteOptions from "@/lib/utils/site-options";
import getAuth from "@/lib/utils/auth";
import getDevicesToken from "@/lib/utils/devices/get-token";
import deleteDevicesToken from "@/lib/utils/devices/delete-token";

export default async function getAvailableDevicesAction() {
  return serverAction<{ devices: Device[] }>(async () => {
    await validateUser();

    const token = await getDevicesToken();

    const devices = await getDevices(token);

    await deleteDevicesToken(token);

    return {
      devices,
    };
  });
}

async function getDevices(token: string): Promise<Device[]> {
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

  const devicesRes:
    | { success: false }
    | {
        success: true;
        data: {
          PC: string;
          Line: string;
          Status: string;
          ["Service Provider"]: number;
          Speed: number;
          ["Service Provider Expire Date"]: string;
          ["Device Type"]: string;
          Duration: number;
          ["Start Date"]: string;
          ["Expire Date"]: string;
          ["Extra Date"]: number;
          ["Supremo ID"]: string | null;
          ["Supremo Pass"]: string | null;
          ["RDP ID"]: string | null;
          ["RDP Password"]: string | null;
          ["Reset URL"]: string | null;
          Port: string | null;
          ["Operating System"]: number;
          Architecture: number;
          Note: string | null;
          ["Is Expire"]: unknown;
          ["Is Technical issue"]: unknown;
          ["Is V2"]: string | null;
          ["Device Location"]: string | null;
          ["Any Desk ID"]: string;
          ["Any Desk Pass"]: string;
        }[];
      } = await fetch(`${remoteDevicesUrl}/api/lines/status/available`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  }).then((r) => r.json());

  if (!devicesRes.success || !priceRes.success)
    throw new UnloggingError("Failed to get devices");

  const dayCut = await SiteOptions.transactionCut.Device.day.get();

  const weekCut = await SiteOptions.transactionCut.Device.week.get();

  const monthCut = await SiteOptions.transactionCut.Device.month.get();

  const devices = devicesRes.data
    .sort((a, b) => (a.PC < b.PC ? -1 : 1))
    .map((device): Device => {
      return {
        pc: device.PC,
        line: device.Line,
        status: device.Status,
        serviceProvider: priceRes.data[device["Service Provider"]].service,
        speed: device.Speed === 0 ? "4G" : "5G",
        serviceProviderExpireDate: device["Service Provider Expire Date"],
        deviceType: device["Device Type"],
        duration:
          device.Duration === 0
            ? "Daily"
            : device.Duration === 1
              ? "Weekly"
              : "Monthly",
        startDate: device["Start Date"],
        expireDate: device["Expire Date"],
        extraDate: device["Extra Date"],
        supremoId: device["Supremo ID"] || "",
        supremoPass: device["Supremo Pass"] || "",
        rdpID: device["RDP ID"] || "",
        rdpPassword: device["RDP Password"] || "",
        resetUrl: device["Reset URL"] || "",
        port: device.Port || "",
        operatingSystem:
          device["Operating System"] === 1
            ? "Linux"
            : device["Operating System"] === 2
              ? "Mac OS"
              : "Windows 10",
        architecture: device.Architecture === 1 ? "64-bit" : "32-bit",
        note: device.Note || "",
        isExpire: device["Is Expire"],
        isTechnicalIssue: device["Is Technical issue"],
        isV2: device["Is V2"] || "",
        deviceLocation: device["Device Location"] || "",
        price: {
          day: calculatePrice(
            dayCut,
            Number(
              priceRes.data[device["Service Provider"]].day.replace(/^\$/, ""),
            ),
          ),
          week: calculatePrice(
            weekCut,
            Number(
              priceRes.data[device["Service Provider"]].week.replace(/^\$/, ""),
            ),
          ),
          month: calculatePrice(
            monthCut,
            Number(
              priceRes.data[device["Service Provider"]].month.replace(
                /^\$/,
                "",
              ),
            ),
          ),
        },
        anyDeskId: device["Any Desk ID"],
        anyDeskPassword: device["Any Desk Pass"],
      };
    });

  return devices;
}

function calculatePrice(cut: number, price: number): number {
  return price + (price * cut) / 100;
}

async function validateUser() {
  const auth = getAuth();

  if (!(await auth.verify([]))) throw new UnloggingError("Unauthorized");
}
