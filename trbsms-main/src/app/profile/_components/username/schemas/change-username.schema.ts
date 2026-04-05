import { z } from "zod";
import usernameUniqueValidator from "../validators/username-unique.validator";

const schema = z.object({
  username: z
    .string({ required_error: "Username is required." })
    .min(1, "Username is required.")
    .min(4, "Username must be at least 4 characters.")
    .max(255, "Username must be at most 255aa characters.")
    .superRefine(async (username, ctx) => {
      const message = await usernameUniqueValidator(username);
      if (!!message) ctx.addIssue({ message, code: "custom" });
    }),
});

export default schema;
