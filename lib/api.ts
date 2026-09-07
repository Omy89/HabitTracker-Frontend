"use client";

/**
 * Real backend client. Talks to the NestJS + Prisma + MongoDB API at
 * NEXT_PUBLIC_API_URL. Session state lives in an httpOnly cookie set by the
 * backend, so every request is sent with `credentials: "include"`.
 */

import type {
  DashboardSummary,
  HabitFormValues,
  HabitWithProgress,
  Session,
  StatisticsSummary,
} from "@/lib/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    let message = `Request failed (${res.status}).`;
    try {
      const body = await res.json();
      if (typeof body?.message === "string") message = body.message;
      else if (Array.isArray(body?.message)) message = body.message.join(" ");
    } catch {
      // response had no JSON body
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ---------- Session ----------

export async function getSession(): Promise<Session | null> {
  try {
    return await request<Session>("/auth/me");
  } catch {
    return null;
  }
}

export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<Session> {
  return request<Session>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}): Promise<Session> {
  return request<Session>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function logout(): Promise<void> {
  await request<{ ok: true }>("/auth/logout", { method: "POST" });
}

export async function updateProfile(
  _userId: string,
  { name, email }: { name: string; email: string }
): Promise<Session> {
  return request<Session>("/users/me", {
    method: "PATCH",
    body: JSON.stringify({ name, email }),
  });
}

export async function changePassword(
  _userId: string,
  { currentPassword, newPassword }: { currentPassword: string; newPassword: string }
): Promise<boolean> {
  const { ok } = await request<{ ok: boolean }>("/users/me/password", {
    method: "PATCH",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return ok;
}

// ---------- Habits ----------

export async function getHabits(_userId: string): Promise<HabitWithProgress[]> {
  return request<HabitWithProgress[]>("/habits");
}

export async function getHabit(habitId: string): Promise<HabitWithProgress> {
  return request<HabitWithProgress>(`/habits/${habitId}`);
}

export async function createHabit(
  _userId: string,
  data: HabitFormValues
): Promise<HabitWithProgress> {
  return request<HabitWithProgress>("/habits", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateHabit(
  habitId: string,
  data: HabitFormValues
): Promise<HabitWithProgress> {
  return request<HabitWithProgress>(`/habits/${habitId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteHabit(habitId: string): Promise<boolean> {
  await request<{ ok: boolean }>(`/habits/${habitId}`, { method: "DELETE" });
  return true;
}

export async function toggleHabitActive(habitId: string): Promise<HabitWithProgress> {
  return request<HabitWithProgress>(`/habits/${habitId}/active`, { method: "PATCH" });
}

/** Sets today's completion percentage (0-100) for a habit. */
export async function setTodayProgress(
  habitId: string,
  _userId: string,
  progress: number
): Promise<HabitWithProgress> {
  return request<HabitWithProgress>(`/habits/${habitId}/progress`, {
    method: "PATCH",
    body: JSON.stringify({ progress: Math.round(progress) }),
  });
}

// ---------- Dashboard / Statistics ----------

export async function getDashboardSummary(_userId: string): Promise<DashboardSummary> {
  return request<DashboardSummary>("/dashboard");
}

export async function getStatistics(_userId: string): Promise<StatisticsSummary> {
  return request<StatisticsSummary>("/statistics");
}
