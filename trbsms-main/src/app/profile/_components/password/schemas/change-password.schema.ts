import { z } from "zod";

const schema = z
  .object({
    oldPassword: z
      .string({ required_error: "Old password is required." })
      .min(1, "Old password is required.")
      .max(50, "Invalid old password.")
      //must contain lowercase letter
      .refine((value) => /[a-z]/.test(value), "Invalid old password.")
      //must contain uppercase letter
      .refine((value) => /[A-Z]/.test(value), {
        message: "Invalid old password.",
      })
      //must contain number
      .refine((value) => /[0-9]/.test(value), {
        message: "Invalid old password.",
      })
      //must contain special character
      .refine((value) => /[^a-zA-Z0-9]/.test(value), {
        message: "Invalid old password.",
      })
      //must be at least 8 characters
      .refine((value) => value.length >= 8, {
        message: "Invalid old password.",
      }),
    newPassword: z
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
    confirmNewPassword: z
      .string({ required_error: "Confirm Password is required." })
      .min(1, "Confirm Password is required."),
  })
  .refine(
    ({ newPassword, confirmNewPassword }) => newPassword === confirmNewPassword,
    {
      message: "Confirm Password does not match Password.",
      path: ["confirmPassword"],
    },
  );

export default schema;
