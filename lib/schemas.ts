import { z } from 'zod';
import { CATEGORIES, FREQUENCIES, PRIORITIES } from '@/lib/types';
import { PASSWORD_RULES } from '@/lib/password';

const email = z
  .string()
  .trim()
  .min(1, 'Email is required.')
  .email('Enter a valid email.');

const name = z
  .string()
  .trim()
  .min(2, 'Enter your name (at least 2 characters).')
  .max(50, "Name can't be longer than 50 characters.");

const strongPassword = z
  .string()
  .refine(
    (value) => PASSWORD_RULES.every((rule) => rule.test(value)),
    "Your password doesn't meet all the requirements.",
  );

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required.'),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name,
    email,
    password: strongPassword,
    confirmPassword: z.string().min(1, 'Confirm your password.'),
  })
  .refine(
    (data) => !data.confirmPassword || data.password === data.confirmPassword,
    { message: "Passwords don't match.", path: ['confirmPassword'] },
  );
export type RegisterValues = z.infer<typeof registerSchema>;

export const accountSchema = z.object({ name, email });
export type AccountValues = z.infer<typeof accountSchema>;

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password.'),
    newPassword: strongPassword,
    confirmPassword: z.string().min(1, 'Confirm your new password.'),
  })
  .refine(
    (data) => !data.newPassword || data.newPassword !== data.currentPassword,
    {
      message: 'The new password must be different from the current one.',
      path: ['newPassword'],
    },
  )
  .refine(
    (data) =>
      !data.confirmPassword || data.newPassword === data.confirmPassword,
    { message: "Passwords don't match.", path: ['confirmPassword'] },
  );
export type PasswordChangeValues = z.infer<typeof passwordChangeSchema>;

export const habitSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Give your habit a name.')
      .max(60, "Name can't be longer than 60 characters."),
    description: z
      .string()
      .trim()
      .max(300, "Description can't be longer than 300 characters.")
      .optional()
      .default(''),
    category: z.enum(CATEGORIES),
    frequency: z.enum(FREQUENCIES),
    days: z.array(z.number().int().min(0).max(6)).default([]),
    priority: z.enum(PRIORITIES),
    startDate: z.string().min(1, 'Choose a start date.'),
    endDate: z.string().optional().default(''),
  })
  .refine(
    (data) =>
      !data.endDate || !data.startDate || data.endDate >= data.startDate,
    { message: "End date can't be before the start date.", path: ['endDate'] },
  )
  .refine((data) => data.frequency !== 'Custom' || data.days.length > 0, {
    message: 'Choose at least one day.',
    path: ['days'],
  })
  .transform((data) => ({
    ...data,
    days: data.frequency === 'Custom' ? data.days : [],
  }));
export type HabitValues = z.infer<typeof habitSchema>;

export function zodErrors(
  schema: z.ZodTypeAny,
  data: unknown,
): Record<string, string> {
  const result = schema.safeParse(data);
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join('.') || '_form';
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}
