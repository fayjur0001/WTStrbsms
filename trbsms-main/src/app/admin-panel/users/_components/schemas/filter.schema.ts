import { z } from "zod";

export default function getSchema(roles: [string, ...string[]]) {
  return z.object({
    username: z
      .string({
        required_error: "Username is required",
      })
      .optional()
      .default(""),
    email: z
      .string({
        required_error: "TGID is required",
      })
      .optional()
      .default(""),
    role: z
      .enum(roles, {
        required_error: "Role is required",
        message: "Invalid role",
      })
      .optional()
      .default("all"),
    bannedOnly: z.boolean().optional().default(false),
    onlineOnly: z.boolean().optional().default(false),
  });
}
