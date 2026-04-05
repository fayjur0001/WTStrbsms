import { z } from "zod";
import ticketIdExistsValidator from "../../validators/ticket-id-exists.validator";

const schema = z.object({
  text: z.string().min(1),
  ticketId: z.coerce
    .number()
    .min(1)
    .superRefine(async (id, ctx) => {
      const message = await ticketIdExistsValidator(id);

      if (!!message) return ctx.addIssue({ message, code: "custom" });
    }),
});

export default schema;
