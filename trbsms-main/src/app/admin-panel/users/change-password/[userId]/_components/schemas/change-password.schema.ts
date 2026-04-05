import { z } from "zod";
import idExistsValidator from "../../../../_components/validators/id-exists.validator";

const schema = z
  .object({
    id: z.coerce
      .number()
      .min(1)
      .superRefine(async (id, ctx) => {
        const message = await idExistsValidator(id);

        if (!!message) return ctx.addIssue({ message, code: "custom" });
      }),
    password: z
      .string({ required_error: "Password is required." })
      .min(1, "Password is required.")
      .max(50, "Password must be at most 50 characters.")
      //must contain lowercase letter
      .refine((value) => /[a-z]/.test(value), "Password must lowercase letter.")
      //must contain uppercase letter
      .refine((value) => /[A-Z]/.test(value), {
        message: "Password must contain uppercase letter.",
      })
      //must contain number
      .refine((value) => /[0-9]/.test(value), {
        message: "Password must contain number.",
      })
      //must contain special character
      .refine((value) => /[^a-zA-Z0-9]/.test(value), {
        message: "Password must contain special character.",
      })
      //must be at least 8 characters
      .refine((value) => value.length >= 8, {
        message: "Password must be at least 8 characters.",
      }),
    confirmPassword: z
      .string({ required_error: "Confirm Password is required." })
      .min(1, "Confirm Password is required."),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: "Confirm Password does not match Password.",
    path: ["confirmPassword"],
  });

export default schema;
