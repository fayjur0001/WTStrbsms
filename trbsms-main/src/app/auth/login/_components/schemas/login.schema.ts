import { z } from "zod";

const schema = z.object({
  username: z.string().min(1, "Email is required."),
  password: z
    .string({ required_error: "Password is required." })
    .min(1, "Password is required.")
    .max(50, "Invalid password.")
    //must contain lowercase letter
    .refine((value) => /[a-z]/.test(value), "Invalid password.")
    //must contain uppercase letter
    .refine((value) => /[A-Z]/.test(value), {
      message: "Invalid password.",
    })
    //must contain number
    .refine((value) => /[0-9]/.test(value), {
      message: "Invalid password.",
    })
    //must contain special character
    .refine((value) => /[^a-zA-Z0-9]/.test(value), {
      message: "Invalid password.",
    })
    //must be at least 8 characters
    .refine((value) => value.length >= 8, {
      message: "Invalid password.",
    }),
  pinCode: z
    .string()
    .optional()
    .superRefine((value, ctx) => {
      if (!value) return;

      if (!/^[0-9]*$/.test(value))
        return ctx.addIssue({ code: "custom", message: "Invalid pin code." });

      if (value.length !== 6)
        return ctx.addIssue({ code: "custom", message: "Invalid pin code." });
    }),
  rememberMe: z.coerce
    .string()
    .refine((value) => value === "" || /^(true|false)$/.test(value)),
});

export default schema;
