import { z } from "zod";

const schema = z
  .object({
    oldPinCode: z.string().superRefine((pinCode, ctx) => {
      if (!!pinCode) {
        if (!/^[0-9]+$/.test(pinCode)) {
          return ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Pin code must contain only digits.",
          });
        } else if (pinCode.length !== 6) {
          return ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Pin code must be 6 digits.",
          });
        }
      }
    }),
    newPinCode: z
      .string({ required_error: "New pin code is required." })
      .regex(/^[0-9]+$/, "New pin code must contain only digits.")
      .min(6, "New pin code must be 6 digits.")
      .max(6, "New pin code must be 6 digits."),
    confirmNewPinCode: z
      .string({ required_error: "Confirm pin code is required." })
      .min(1, "Confirm pin code is required.")
      .min(6, "Confirm pin code does not match new pin code."),
  })
  .refine(
    ({ newPinCode, confirmNewPinCode }) => newPinCode === confirmNewPinCode,
    {
      message: "Confirm new pin code does not match new pin code.",
      path: ["confirmPinCode"],
    },
  );

export default schema;
