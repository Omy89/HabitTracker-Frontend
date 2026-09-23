'use client';

import type {
  DashboardSummary,
  HabitFormValues,
  HabitRecord,
  HabitWithProgress,
  Session,
  StatisticsSummary,
  UserProfile,
} from '@/lib/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

/** `status` is 0 when the server couldn't be reached. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
  } catch {
    throw new ApiError('Network error.', 0);
  }
  if (!res.ok) {
    let message = `Request failed (${res.status}).`;
    try {
      const body = await res.json();
      if (typeof body?.message === 'string') message = body.message;
      else if (Array.isArray(body?.message)) message = body.message.join(' ');
    } catch {}
    throw new ApiError(message, res.status);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function query(params: Record<string, string | undefined>): string {
  const entries = Object.entries(params).filter(
    (entry): entry is [string, string] => !!entry[1],
  );
  return entries.length ? `?${new URLSearchParams(entries)}` : '';
}

// Auth

export async function getSession(): Promise<Session | null> {
  try {
    return await request<Session>('/auth/me');
  } catch {
    return null;
  }
}

export function login(data: { email: string; password: string }) {
  return request<Session>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function register(data: {
  name: string;
  email: string;
  password: string;
}) {
  return request<Session>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function logout(): Promise<void> {
  await request<{ ok: true }>('/auth/logout', { method: 'POST' });
}

// Users

export function getProfile() {
  return request<UserProfile>('/users/me');
}

export function updateProfile(data: { name: string; email: string }) {
  return request<Session>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<boolean> {
  const { ok } = await request<{ ok: boolean }>('/users/me/password', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return ok;
}

// Habits

export function getHabits() {
  return request<HabitWithProgress[]>('/habits');
}

export function getHabit(habitId: string) {
  return request<HabitWithProgress>(`/habits/${habitId}`);
}

export function getHabitRecords(
  habitId: string,
  range: { from?: string; to?: string } = {},
) {
  return request<HabitRecord[]>(`/habits/${habitId}/records${query(range)}`);
}

export function createHabit(data: HabitFormValues) {
  return request<HabitWithProgress>('/habits', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateHabit(habitId: string, data: HabitFormValues) {
  return request<HabitWithProgress>(`/habits/${habitId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteHabit(habitId: string): Promise<boolean> {
  await request<{ ok: boolean }>(`/habits/${habitId}`, { method: 'DELETE' });
  return true;
}

export function toggleHabitActive(habitId: string) {
  return request<HabitWithProgress>(`/habits/${habitId}/active`, {
    method: 'PATCH',
  });
}

/** Records progress (0-100) for a day; defaults to today on the server. */
export function setProgress(habitId: string, progress: number, date?: string) {
  return request<HabitWithProgress>(`/habits/${habitId}/progress`, {
    method: 'PATCH',
    body: JSON.stringify({ progress: Math.round(progress), date }),
  });
}

// Statistics

export function getDashboardSummary() {
  return request<DashboardSummary>('/statistics/dashboard');
}

export function getStatistics(range: { from?: string; to?: string } = {}) {
  return request<StatisticsSummary>(`/statistics${query(range)}`);
}
