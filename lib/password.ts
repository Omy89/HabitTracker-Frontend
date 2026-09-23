// Password policy, mirrored in the backend (src/auth/password.rules.ts).

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;

export interface PasswordRule {
  label: string;
  test: (password: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  {
    label: '8 to 72 characters',
    test: (p) =>
      p.length >= PASSWORD_MIN_LENGTH && p.length <= PASSWORD_MAX_LENGTH,
  },
  { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p) => /\d/.test(p) },
  {
    label: 'One symbol (e.g. ! @ # $ %)',
    test: (p) => /[^A-Za-z0-9\s]/.test(p),
  },
  { label: 'No spaces', test: (p) => p.length > 0 && !/\s/.test(p) },
];

export const STRENGTH_LABELS = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];

/** 0-4, used for the strength meter. */
export function passwordScore(password: string): number {
  if (!password) return 0;
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  let score = Math.floor((passed / PASSWORD_RULES.length) * 3);
  if (passed === PASSWORD_RULES.length && password.length >= 12) score += 1;
  return Math.min(score, 4);
}
