import { z } from "zod";

const schema = z.object({
  apiUser: z
    .string({
      required_error: "API User is required.",
    })
    .min(1, "API User is required."),
  apiKey: z
    .string({
      required_error: "API Key is required.",
    })
    .min(1, "API Key is required."),
  cut: z.object({
    oneTime: z.coerce
      .number({
        invalid_type_error: "Onetime transaction cut is required.",
        required_error: "Onetime transaction cut is required.",
      })
      .nonnegative("Onetime transaction cut must be non-negative.")
      .gt(0, "Onetime transaction cut can't be zero."),
    longTerm: z.object({
      short: z.coerce
        .number({
          invalid_type_error: "Short term transaction cut is required.",
          required_error: "Short term transaction cut is required.",
        })
        .nonnegative("Short term transaction cut must be non-negative.")
        .gt(0, "Short term transaction cut can't be zero."),
      regular: z.coerce
        .number({
          invalid_type_error: "Regular term transaction cut is required.",
          required_error: "Regular term transaction cut is required.",
        })
        .nonnegative("Regular term transaction cut must be non-negative.")
        .gt(0, "Regular term transaction cut can't be zero."),
      unlimited: z.coerce
        .number({
          invalid_type_error: "Unlimited term transaction cut is required.",
          required_error: "Unlimited term transaction cut is required.",
        })
        .nonnegative("Unlimited term transaction cut must be non-negative."),
    }),
    proxy: z.object({
      shared: z.object({
        day: z.coerce
          .number({
            invalid_type_error: "Daily shared proxy cut is required.",
            required_error: "Daily shared proxy cut is required.",
          })
          .nonnegative("Daily shared proxy cut must be non-negative.")
          .gt(0, "Daily shared proxy cut can't be zero."),
        week: z.coerce
          .number({
            invalid_type_error: "Weekly shared proxy cut is required.",
            required_error: "Weekly shared proxy cut is required.",
          })
          .nonnegative("Weekly shared proxy cut must be non-negative.")
          .gt(0, "Weekly shared proxy cut can't be zero."),
        month: z.coerce
          .number({
            invalid_type_error: "Monthly shared proxy cut is required.",
            required_error: "Monthly shared proxy cut is required.",
          })
          .nonnegative("Monthly shared proxy cut must be non-negative."),
      }),
      exclusive: z.object({
        day: z.coerce
          .number({
            invalid_type_error: "Daily exclusive proxy cut is required.",
            required_error: "Daily exclusive proxy cut is required.",
          })
          .nonnegative("Daily exclusive proxy cut must be non-negative.")
          .gt(0, "Daily exclusive proxy cut can't be zero."),
        week: z.coerce
          .number({
            invalid_type_error: "Weekly exclusive proxy cut is required.",
            required_error: "Weekly exclusive proxy cut is required.",
          })
          .nonnegative("Weekly exclusive proxy cut must be non-negative.")
          .gt(0, "Weekly exclusive proxy cut can't be zero."),
        month: z.coerce
          .number({
            invalid_type_error: "Monthly exclusive proxy cut is required.",
            required_error: "Monthly exclusive proxy cut is required.",
          })
          .nonnegative("Monthly exclusive proxy cut must be non-negative."),
      }),
    }),
    device: z.object({
      day: z.coerce
        .number({
          invalid_type_error: "Daily device cut is required.",
          required_error: "Daily device cut is required.",
        })
        .nonnegative("Daily device cut must be non-negative.")
        .gt(0, "Daily device cut can't be zero."),
      week: z.coerce
        .number({
          invalid_type_error: "Weekly device cut is required.",
          required_error: "Weekly device cut is required.",
        })
        .nonnegative("Weekly device cut must be non-negative.")
        .gt(0, "Weekly device cut can't be zero."),
      month: z.coerce
        .number({
          invalid_type_error: "Monthly device cut is required.",
          required_error: "Monthly device cut is required.",
        })
        .nonnegative("Monthly device cut must be non-negative.")
        .gt(0, "Monthly device cut can't be zero."),
    }),
  }),
  sharedProxyPrice: z.object({
    hour: z.coerce
      .number({
        invalid_type_error: "Hourly shared proxy price is required.",
        required_error: "Hourly shared proxy price is required.",
      })
      .gt(0, "Hourly shared proxy price is required."),
    day: z.coerce
      .number({
        invalid_type_error: "Daily shared proxy price is required.",
        required_error: "Daily shared proxy price is required.",
      })
      .gt(0, "Daily shared proxy price is required."),
    week: z.coerce
      .number({
        invalid_type_error: "Weekly shared proxy price is required.",
        required_error: "Weekly shared proxy price is required.",
      })
      .gt(0, "Weekly shared proxy price is required."),
    month: z.coerce
      .number({
        invalid_type_error: "Monthly shared proxy price is required.",
        required_error: "Monthly shared proxy price is required.",
      })
      .gt(0, "Monthly shared proxy price is required."),
  }),
  exclusiveProxyPrice: z.object({
    hour: z.coerce
      .number({
        invalid_type_error: "Hourly exclusive proxy price is required.",
        required_error: "Hourly exclusive proxy price is required.",
      })
      .gt(0, "Hourly exclusive proxy price is required."),
    day: z.coerce
      .number({
        invalid_type_error: "Daily exclusive proxy price is required.",
        required_error: "Daily exclusive proxy price is required.",
      })
      .gt(0, "Daily exclusive proxy price is required."),
    week: z.coerce
      .number({
        invalid_type_error: "Weekly exclusive proxy price is required.",
        required_error: "Weekly exclusive proxy price is required.",
      })
      .gt(0, "Weekly exclusive proxy price is required."),
    month: z.coerce
      .number({
        invalid_type_error: "Monthly exclusive proxy price is required.",
        required_error: "Monthly exclusive proxy price is required.",
      })
      .gt(0, "Monthly exclusive proxy price is required."),
  }),
  callbackSecret: z
    .string({
      invalid_type_error: "Callback secret is required.",
      required_error: "Callback secret is required.",
    })
    .min(1, "Callback secret is required."),
  devices: z.object({
    login: z
      .string({
        required_error: "Login is required.",
        invalid_type_error: "Login is required.",
      })
      .min(1, "Login is required."),
    password: z
      .string({
        required_error: "Password is required.",
        invalid_type_error: "Password is required.",
      })
      .min(1, "Password is required."),
  }),
});

export default schema;
