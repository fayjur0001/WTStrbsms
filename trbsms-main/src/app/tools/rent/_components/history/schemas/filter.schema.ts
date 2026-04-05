import { z } from "zod";

export default function getSchema(
  onlineStatusArray: [string, ...string[]],
  statusArray: [string, ...string[]],
) {
  return z.object({
    service: z.string().optional().default(""),
    mdn: z.string().optional().default(""),
    onlineStatus: z
      .enum(onlineStatusArray, {
        message: "Online status is required.",
        required_error: "Online status is required.",
        invalid_type_error: "Online status is required.",
      })
      .optional()
      .default("All"),
    status: z
      .enum(statusArray, {
        message: "Status is required.",
        required_error: "Status is required.",
        invalid_type_error: "Status is required.",
      })
      .optional()
      .default("All"),
  });
}
