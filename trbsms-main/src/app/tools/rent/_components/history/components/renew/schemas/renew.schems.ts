import { z } from "zod";
import idExistsValidator from "../validators/id-exists.validator";

const schema = z.object({
  id: z.coerce
    .number()
    .min(1)
    .superRefine(async (id, ctx) => {
      const message = await idExistsValidator(id);

      if (!!message) return ctx.addIssue({ message, code: "custom" });
    }),
  rentType: z.enum(["short", "regular", "unlimited"]),
});

export default schema;
