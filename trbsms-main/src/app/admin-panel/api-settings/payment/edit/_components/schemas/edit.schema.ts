import { z } from "zod";

const schema = z.object({
  label: z.enum(["callbackSecret", "apiKey"]),
  value: z
    .string({
      invalid_type_error: "Value is required.",
      required_error: "Value is required.",
    })
    .min(1, "Value is required."),
});

export default schema;
