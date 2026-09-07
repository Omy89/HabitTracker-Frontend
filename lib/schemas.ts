import { z } from "zod";
import { CATEGORIES, FREQUENCIES, PRIORITIES } from "@/lib/types";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required.").email("Enter a valid email."),
  password: z.string().min(1, "Password is required."),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Enter your name."),
    email: z.string().min(1, "Email is required.").email("Enter a valid email."),
    password: z.string().min(6, "Use at least 6 characters."),
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });
export type RegisterValues = z.infer<typeof registerSchema>;

export const accountSchema = z.object({
  name: z.string().trim().min(1, "Enter your name."),
  email: z.string().min(1, "Email is required.").email("Enter a valid email."),
});
export type AccountValues = z.infer<typeof accountSchema>;

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z.string().min(6, "Use at least 6 characters."),
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });
export type PasswordChangeValues = z.infer<typeof passwordChangeSchema>;

export const habitSchema = z
  .object({
    name: z.string().trim().min(1, "Give your habit a name."),
    description: z.string().trim().optional().default(""),
    category: z.enum(CATEGORIES),
    frequency: z.enum(FREQUENCIES),
    priority: z.enum(PRIORITIES),
    startDate: z.string().min(1, "Choose a start date."),
    endDate: z.string().optional().default(""),
  })
  .refine(
    (data) => !data.endDate || !data.startDate || data.endDate >= data.startDate,
    { message: "End date can't be before the start date.", path: ["endDate"] }
  );
export type HabitValues = z.infer<typeof habitSchema>;

/**
 * Runs a Zod schema and returns a flat { field: message } map instead of
 * Zod's issue list, so existing `touched.field && errors.field` form JSX
 * keeps working unchanged.
 */
export function zodErrors<T>(
  schema: z.ZodType<T>,
  data: unknown
): Record<string, string> {
  const result = schema.safeParse(data);
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}
