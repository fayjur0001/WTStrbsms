import { z } from "zod";

const schema = z.object({
  hostUrl: z
    .string({
      invalid_type_error: "Host url is required.",
      required_error: "Host url is required.",
    })
    .min(1, "Host url is required."),
});

export default schema;
