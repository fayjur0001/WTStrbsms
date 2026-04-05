import { z } from "zod";
import uniqueTXIDValidator from "../validators/unique-txid.validator";

export default function getNewTransactionSchema(array: [string, ...string[]]) {
  return z.object({
    userId: z.coerce
      .number({
        invalid_type_error: "Username is required.",
        required_error: "Username is required.",
      })
      .min(1, "Username is required."),
    txid: z
      .string({
        invalid_type_error: "Txid is required.",
        required_error: "Txid is required.",
      })
      .min(1, "Txid is required.")
      .superRefine(async (txid, ctx) => {
        const message = await uniqueTXIDValidator(txid);

        if (!!message) return ctx.addIssue({ message, code: "custom" });
      }),
    walletAddress: z
      .string({
        invalid_type_error: "Wallet address is required.",
        required_error: "Wallet address is required.",
      })
      .min(1, "Wallet address is required."),
    currency: z.enum(array, {
      required_error: "Wallet name is required.",
      invalid_type_error: "Wallet name is required.",
    }),
    amount: z.coerce
      .number({
        invalid_type_error: "Amount is required.",
        required_error: "Amount is required.",
      })
      .positive("Amount must be a positive number."),
  });
}
