import { z } from "zod";
import jabberUniqueValidator from "./../validators/jabber.validator";

const schema = z.object({
  jabber: z
    .string({ required_error: "Jabber is required." })
    .min(1, "Jabber is required.")
    .superRefine(async (jabber, ctx) => {
      const message = await jabberUniqueValidator(jabber);
      if (!!message) {
        ctx.addIssue({ message, code: "custom" });
      }
    }),
});

export default schema;
