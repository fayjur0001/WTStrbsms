import { z } from "zod";

const schema = z.object({
  siteName: z
    .string({
      required_error: "Site name is required",
    })
    .min(1, "Site name is required."),
});

export default schema;
