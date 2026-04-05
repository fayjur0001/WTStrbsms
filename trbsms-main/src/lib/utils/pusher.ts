export default async function pusher({
  page,
  to,
  payload,
}: {
  page: string;
  to?: string;
  payload?:
    | {
        action: "new";
      }
    | {
        action: "update";
        id: number;
      };
}) {
  const url = new URL("http://localhost:3000/pusher");

  url.searchParams.set("secret", process.env.PUSHER_SECRET!);
  url.searchParams.set("page", page);

  if (!!to) {
    url.searchParams.set("to", to);
  }

  if (!!payload) {
    url.searchParams.set("action", payload.action);

    if (payload.action === "update")
      url.searchParams.set("id", String(payload.id));
  }

  await fetch(url);
}
