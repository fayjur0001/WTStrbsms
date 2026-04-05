import { z } from "zod";
import idExistsValidator from "../../../validators/id-exists.validator";

const schema = z.object({
  id: z.coerce
    .number({ invalid_type_error: "This error should not happen." })
    .min(1, "This error should not happen.")
    .superRefine(async (id, ctx) => {
      const message = await idExistsValidator(id);

      if (!!message)
        return ctx.addIssue({
          message: "This error should not happen.",
          code: "custom",
        });
    }),
  code: z
    .string()
    .min(1, "Pin code is required.")
    .min(6, "Invalid pin code.")
    .max(6, "Invalid pin code.")
    .regex(new RegExp("^[0-9]*$"), "Invalid pin code."),
});

export default schema;
