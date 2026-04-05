import { z } from "zod";
import usernameUniqueValidator from "../validators/username-unique.validator";
import emailUniqueValidator from "../validators/email-unique.validator";

const schema = z
  .object({
    username: z
      .string({ required_error: "Username is required." })
      .min(1, "Username is required.")
      .min(4, "Username must be at least 4 characters.")
      .max(255, "Username must be at most 255 characters.")
      .superRefine(async (username, ctx) => {
        const message = await usernameUniqueValidator(username);
        if (!!message) ctx.addIssue({ message, code: "custom" });
      }),
    email: z
      .string({ required_error: "Email is required." })
      .min(1, "Email is required.")
      .email("Invalid email.")
      .superRefine(async (email, ctx) => {
        const message = await emailUniqueValidator(email);
        if (!!message) ctx.addIssue({ message, code: "custom" });
      }),
    password: z
      .string({ required_error: "Password is required." })
      .min(1, "Password is required.")
      .max(50, "Password must be at most 50 characters.")
      //must contain lowercase letter
      .refine((value) => /[a-z]/.test(value), "Password must lowercase letter.")
      //must contain uppercase letter
      .refine((value) => /[A-Z]/.test(value), {
        message: "Password must contain uppercase letter.",
      })
      //must contain number
      .refine((value) => /[0-9]/.test(value), {
        message: "Password must contain number.",
      })
      //must contain special character
      .refine((value) => /[^a-zA-Z0-9]/.test(value), {
        message: "Password must contain special character.",
      })
      //must be at least 8 characters
      .refine((value) => value.length >= 8, {
        message: "Password must be at least 8 characters.",
      }),
    confirmPassword: z
      .string({ required_error: "Confirm Password is required." })
      .min(1, "Confirm Password is required.")
      .min(8, "Confirm Password does not match Password."),
    pinCode: z
      .string({
        required_error: "Pin Code is required.",
        invalid_type_error: "Pin Code is required.",
      })
      .min(1, "Pin Code is required.")
      .regex(new RegExp("^[0-9]*$"), "Pin Code must contain only numbers.")
      .min(6, "Pin Code must be 6 digits.")
      .max(6, "Pin Code must be 6 digits."),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: "Confirm Password does not match Password.",
    path: ["confirmPassword"],
  });

export default schema;
