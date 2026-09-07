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
import { useRouter } from "next/navigation";
import * as api from "@/lib/api";
import type { Session } from "@/lib/types";

interface AuthContextValue {
  user: Session | null | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<Session>;
  register: (data: { name: string; email: string; password: string }) => Promise<Session>;
  logout: () => Promise<void>;
  refreshUser: (partial: Partial<Session>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // undefined = loading, null = no session
  const [user, setUser] = useState<Session | null | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    api.getSession().then(setUser);
  }, []);

  const login = useCallback(async (credentials: { email: string; password: string }) => {
    const session = await api.login(credentials);
    setUser(session);
    return session;
  }, []);

  const register = useCallback(
    async (data: { name: string; email: string; password: string }) => {
      const session = await api.register(data);
      setUser(session);
      return session;
    },
    []
  );

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
    router.push("/login");
  }, [router]);

  const refreshUser = useCallback((partial: Partial<Session>) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading: user === undefined,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
