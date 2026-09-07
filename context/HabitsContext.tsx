"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { HabitFormValues, HabitWithProgress } from "@/lib/types";

interface HabitsContextValue {
  habits: HabitWithProgress[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  createHabit: (data: HabitFormValues) => Promise<HabitWithProgress>;
  updateHabit: (id: string, data: HabitFormValues) => Promise<HabitWithProgress>;
  deleteHabit: (id: string) => Promise<void>;
  toggleActive: (id: string) => Promise<HabitWithProgress>;
  setProgress: (id: string, progress: number) => Promise<HabitWithProgress>;
}

const HabitsContext = createContext<HabitsContextValue | null>(null);

export function HabitsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [habits, setHabits] = useState<HabitWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getHabits(user.id);
      setHabits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load your habits.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      reload();
    } else {
      setHabits([]);
      setLoading(false);
    }
  }, [user, reload]);

  const createHabit = useCallback(
    async (data: HabitFormValues) => {
      if (!user) throw new Error("No active session.");
      const habit = await api.createHabit(user.id, data);
      setHabits((prev) => [...prev, habit]);
      return habit;
    },
    [user]
  );

  const updateHabit = useCallback(async (id: string, data: HabitFormValues) => {
    const habit = await api.updateHabit(id, data);
    setHabits((prev) => prev.map((h) => (h.id === id ? habit : h)));
    return habit;
  }, []);

  const deleteHabit = useCallback(async (id: string) => {
    await api.deleteHabit(id);
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const toggleActive = useCallback(async (id: string) => {
    const habit = await api.toggleHabitActive(id);
    setHabits((prev) => prev.map((h) => (h.id === id ? habit : h)));
    return habit;
  }, []);

  const setProgress = useCallback(
    async (id: string, progress: number) => {
      if (!user) throw new Error("No active session.");
      const habit = await api.setTodayProgress(id, user.id, progress);
      setHabits((prev) => prev.map((h) => (h.id === id ? habit : h)));
      return habit;
    },
    [user]
  );

  const value = useMemo<HabitsContextValue>(
    () => ({
      habits,
      loading,
      error,
      reload,
      createHabit,
      updateHabit,
      deleteHabit,
      toggleActive,
      setProgress,
    }),
    [habits, loading, error, reload, createHabit, updateHabit, deleteHabit, toggleActive, setProgress]
  );

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
}

export function useHabits(): HabitsContextValue {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error("useHabits must be used within HabitsProvider");
  return ctx;
}
