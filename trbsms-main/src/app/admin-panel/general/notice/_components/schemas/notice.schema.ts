import { z } from "zod";

const schema = z.object({
  notice: z
    .string({
      invalid_type_error: "Notice is required.",
      required_error: "Notice is required.",
    })
    .min(1, "Notice is required."),
});

export default schema;
