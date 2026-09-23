import { ApiError } from '@/lib/api';

/** Turns any thrown error into a message for the user. */
export function getErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 0) {
      return "Couldn't reach the server. Check your connection and try again.";
    }
    if (err.status >= 500) return 'Something went wrong. Try again.';
    return err.message;
  }
  return 'Something went wrong. Try again.';
}
