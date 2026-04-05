import { z } from "zod";

const schema = z.object({
  mode: z.enum(["day", "week", "month"]).default("day"),
  note: z.string().optional(),
  line: z.coerce.string(),
});

export default schema;
