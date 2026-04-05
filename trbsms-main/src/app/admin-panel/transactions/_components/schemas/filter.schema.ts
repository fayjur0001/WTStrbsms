import { z } from "zod";

export default function getFilterSchema<T extends [string, ...string[]]>(
  array: T,
) {
  return z.object({
    txid: z.string().optional().default(""),
    username: z.string().optional().default(""),
    walletName: z.enum(array).optional().default("All"),
  });
}
