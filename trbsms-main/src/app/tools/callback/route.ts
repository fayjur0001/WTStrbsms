import db from "@/db";
import { MDNMessageModel } from "@/db/schema";
import SiteOptions from "@/lib/utils/site-options";
import UnloggingError from "@/lib/utils/unlogging-error";
import { z } from "zod";

const schema = z
  .object({
    event: z.literal("incoming_message"),
    id: z.string().optional(),
    ltr_id: z.string().optional(),
    timestamp: z.coerce.number(),
    from: z.string(),
    to: z.string(),
    reply: z.string(),
    pin: z.string().optional(),
  })
  .superRefine(({ id, ltr_id }, ctx) => {
    if (!id && !ltr_id)
      return ctx.addIssue({
        code: "custom",
        message: "id or ltr_id is required",
      });
  });

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const urlSecret = url.searchParams.get("secret");

    const secret = await SiteOptions.providerCallbackSecret.get();

    if (secret !== urlSecret)
      return Response.json({ success: false }, { status: 401 });

    const data: unknown = await req.formData().then(Object.fromEntries);

    const { id, ltr_id, timestamp, from, to, reply, pin } = schema.parse(data);

    await db.insert(MDNMessageModel).values({
      requestId: id || ltr_id || "",
      timestamp: new Date(timestamp * 1000),
      from,
      to,
      reply,
      pin,
      type: !!id ? "one_time" : "long_term",
    });

    return Response.json({ success: true });
  } catch (e) {
    if (e instanceof UnloggingError)
      return Response.json({ success: false, message: e.message });

    console.trace(e);
    return Response.json({ success: false, message: "Internal server error." });
  }
}
