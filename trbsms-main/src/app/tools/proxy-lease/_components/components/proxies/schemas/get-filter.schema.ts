import { z } from "zod";

export default function getSchema({
  proxyTypeEnumArray,
  serviceEnumArray,
  unitTypeEnumArray,
}: {
  serviceEnumArray: [string, ...string[]];
  unitTypeEnumArray: [string, ...string[]];
  proxyTypeEnumArray: [string, ...string[]];
}) {
  return z.object({
    proxyType: z.enum(proxyTypeEnumArray, {
      invalid_type_error: "Proxy type is required.",
      required_error: "Proxy type is required.",
    }),
    service: z.enum(serviceEnumArray, {
      invalid_type_error: "Service is required.",
      required_error: "Service is required.",
    }),
    unit: z.coerce
      .number({
        required_error: "Unit is required.",
        invalid_type_error: "Unit is required.",
      })
      .gt(0, "Unite must be a positive number.")
      .int("Unite must be a whole number."),
    unitType: z.enum(unitTypeEnumArray, {
      invalid_type_error: "Unit type is required.",
      required_error: "Unit type is required.",
    }),
    port: z.string().min(1, "Port is required"),
  });
}
