import { z } from "zod";
import emailUniqueValidator from "./../validators/email-unique.validator";

const schema = z.object({
  email: z
    .string({ required_error: "Email is required." })
    .min(1, "Email is required.")
    .email("Invalid email.")
    .superRefine(async (email, ctx) => {
      const message = await emailUniqueValidator(email);
      if (!!message) ctx.addIssue({ message, code: "custom" });
    }),
});

export default schema;
