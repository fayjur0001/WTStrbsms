import Role from "@/types/role.type";
import { z } from "zod";
import userIdValidator from "../validators/user-id.validator";

const genetalSchema = z.object({
  subject: z
    .string({ required_error: "Subject is required." })
    .min(1, "Subject is required."),
  description: z
    .string({ required_error: "Description is required." })
    .min(1, "Description is required."),
});

const adminSchema = z.object({
  userId: z.coerce
    .number({
      required_error: "User id is required.",
      invalid_type_error: "User id is required.",
    })
    .min(1, "User id is required.")
    .superRefine(async (userId, ctx) => {
      const message = await userIdValidator(userId);

      if (!!message)
        ctx.addIssue({
          code: "custom",
          message,
        });
    }),
  ...genetalSchema.shape,
});

export default function getSchema(
  role: Role,
): typeof adminSchema | typeof genetalSchema {
  if (["super admin", "admin"].includes(role)) {
    return adminSchema;
  } else {
    return genetalSchema;
  }
}
