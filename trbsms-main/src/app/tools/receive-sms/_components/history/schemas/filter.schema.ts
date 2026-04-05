import { z } from "zod";

export default function getSchema(array: [string, ...string[]]) {
  return z.object({
    service: z.string().optional().default(""),
    mdn: z.string().optional().default(""),
    status: z
      .enum(array, {
        invalid_type_error: "Status is required.",
        required_error: "Status is required.",
        message: "Status is required.",
      })
      .default("all"),
  });
}
