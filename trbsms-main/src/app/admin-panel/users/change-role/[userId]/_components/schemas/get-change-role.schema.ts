import { z } from "zod";
import userIdExistsValidator from "../validators/user-id-exists.validator";

export default function getChangeRoleSchema(roles: [string, ...string[]]) {
  return z.object({
    role: z.enum(roles, {
      required_error: "Please select a role.",
      invalid_type_error: "Please select a role.",
      message: "Please select a role.",
    }),
    userId: z.coerce
      .number()
      .min(1)
      .superRefine(async (id, ctx) => {
        const message = await userIdExistsValidator(id);

        if (!!message) return ctx.addIssue({ message, code: "custom" });
      }),
  });
}
