import { Metadata } from "next";
import { z } from "zod";
import { notFound, redirect } from "next/navigation";
import getAuth from "@/lib/utils/auth";
import ticketIdExistsValidator from "./_components/validators/ticket-id-exists.validator";
import Client from "./_components/client";

export const metadata: Metadata = {
  title: "Chat",
};

const paramsSchema = z.object({
  ticketId: z.coerce.number().min(1),
});

export default async function Chat(data: { params: Promise<unknown> }) {
  const auth = getAuth();
  if (!(await auth.verify([]))) return redirect("/");

  const payload = await auth.getPayload();

  let params: z.infer<typeof paramsSchema>;
  try {
    params = paramsSchema.parse(await data.params);
  } catch {
    return notFound();
  }

  const ticketExists: boolean = await ticketIdExistsValidator(
    params.ticketId,
  ).then((r) => !Boolean(r));

  if (!ticketExists) return notFound();

  return (
    <main>
      <Client currentUserId={payload.id} ticketId={params.ticketId} />
    </main>
  );
}
