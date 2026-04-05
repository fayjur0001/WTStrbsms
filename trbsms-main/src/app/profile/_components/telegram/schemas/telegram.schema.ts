import { z } from "zod";
import telegramUniqueValidator from "../validators/telegram.validator";

const schema = z.object({
  telegram: z
    .string({ required_error: "Telegram is required." })
    .min(1, "Telegram is required.")
    .superRefine(async (telegram, ctx) => {
      const message = await telegramUniqueValidator(telegram);

      if (!!message) {
        ctx.addIssue({
          code: "custom",
          message,
        });
      }
    }),
});

export default schema;
