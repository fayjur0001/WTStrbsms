import { z } from "zod";
import minimumAmountValidator from "../validators/minimum-amount.validator";

export default function getSchema(cryptoEnumArray: [string, ...string[]]) {
  return z
    .object({
      crypto: z.enum(cryptoEnumArray, {
        invalid_type_error: "Currency is required.",
        required_error: "Currency is required.",
        message: "Currency is required.",
      }),
      amount: z.coerce
        .number({
          invalid_type_error: "Amount is required.",
          required_error: "Amount is required.",
          message: "Amount is required.",
        })
        .min(1, "Amount is required.")
        .min(10, "Amount must be greater than 10 dollars."),
    })
    .superRefine(async ({ amount, crypto }, ctx) => {
      const message = await minimumAmountValidator(amount, crypto);

      if (!!message)
        return ctx.addIssue({ message, code: "custom", path: ["amount"] });
    });
}
