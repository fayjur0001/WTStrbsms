import { z } from "zod";

const schema = z.object({
  tos: z.string().min(1, "Terms of Service is required."),
});

export default schema;
