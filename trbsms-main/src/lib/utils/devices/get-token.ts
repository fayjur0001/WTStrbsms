import remoteDevicesUrl from "../remote-devices-url";
import SiteOptions from "../site-options";
import UnloggingError from "../unlogging-error";

export default async function getDevicesToken(): Promise<string> {
  const login = await SiteOptions.devices.login.get();
  const password = await SiteOptions.devices.password.get();

  const res: { success: true; token: string } | { success: false } =
    await fetch(`${remoteDevicesUrl}/api/create-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        login,
        password,
      }),
    }).then((r) => r.json());

  if (!res.success) throw new UnloggingError("Failed to get token");
  return res.token;
}
