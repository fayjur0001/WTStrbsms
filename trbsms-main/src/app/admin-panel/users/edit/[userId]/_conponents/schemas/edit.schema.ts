import { z } from "zod";
import usernameDoesNotExistValidator from "../validators/username-does-not-exist.validator";
import emailDoesNotExistValidator from "../validators/email-does-not-exist.validator";
import jabberDoesNotExistValidator from "../validators/jabber-does-not-exist.validator";
import telegramDoesNotExistValidator from "../validators/telegram-does-not-exist.validator";
import idExistsValidator from "../../../../_components/validators/id-exists.validator";

export default function getSchema(id: number) {
  return z.object({
    id: z.coerce
      .number()
      .min(1)
      .superRefine(async (id, ctx) => {
        const message = await idExistsValidator(id);

        if (!!message) return ctx.addIssue({ message, code: "custom" });
      }),
    username: z
      .string({ required_error: "Username is required." })
      .min(1, "Username is required.")
      .min(4, "Username must be at least 4 characters.")
      .max(255, "Username must be at most 255 characters.")
      .superRefine(async (username, ctx) => {
        const message = await usernameDoesNotExistValidator(id, username);
        if (!!message) ctx.addIssue({ message, code: "custom" });
      }),
    email: z
      .string({ required_error: "Email is required." })
      .min(1, "Email is required.")
      .email("Invalid email.")
      .superRefine(async (email, ctx) => {
        const message = await emailDoesNotExistValidator(id, email);
        if (!!message) ctx.addIssue({ message, code: "custom" });
      }),
    jabber: z
      .string({ required_error: "Jabber is required." })
      .min(1, "Jabber is required.")
      .max(255, "Jabber must be at most 255 characters.")
      .superRefine(async (jabber, ctx) => {
        const message = await jabberDoesNotExistValidator(id, jabber);
        if (!!message) ctx.addIssue({ message, code: "custom" });
      }),
    telegram: z
      .string({ required_error: "Telegram is required." })
      .min(1, "Telegram is required.")
      .max(255, "Telegram must be at most 255 characters.")
      .superRefine(async (telegram, ctx) => {
        const message = await telegramDoesNotExistValidator(id, telegram);
        if (!!message) ctx.addIssue({ message, code: "custom" });
      }),
  });
}
