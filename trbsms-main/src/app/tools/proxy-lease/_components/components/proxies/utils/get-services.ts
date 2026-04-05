import apiUrl from "@/lib/utils/api-url";

export default async function getServices(
  user: string,
  apiKey: string,
): Promise<[string, ...string[]]> {
  const url = new URL(apiUrl);
  url.searchParams.set("cmd", "list_services");
  url.searchParams.set("user", user);
  url.searchParams.set("api_key", apiKey);

  const res:
    | { status: "ok"; message: { name: string }[] }
    | { status: "error"; message: string } = await fetch(url).then((r) =>
    r.json(),
  );

  if (res.status === "error") throw new Error(res.message);

  return res.message.map((m) => m.name).toSorted() as [string, ...string[]];
}
