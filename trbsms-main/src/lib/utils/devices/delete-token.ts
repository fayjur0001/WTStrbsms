import remoteDevicesUrl from "../remote-devices-url";

export default async function deleteDevicesToken(token: string) {
  await fetch(`${remoteDevicesUrl}/api/invalidate-token`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
}
