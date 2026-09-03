"use client";

import { createContext, useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export interface User {
  id: string;
  name: string;
  email: string;
  branch: string;
  year: number;
  telegram_username: string;
  subjects: string[];
  created_at: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  branch: string;
  year: number;
  telegram_username: string;
  subjects?: string[];
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  devLogin: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("UniKit_token");
    
    if (token) {
      api
        .get<{ student: User }>("/api/auth/me", { token })
        .then((res) => setUser(res.student))
        .catch(() => localStorage.removeItem("UniKit_token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const devLogin = useCallback(async () => {
    const token = "dev-token";
    localStorage.setItem("UniKit_token", token);
    const res = await api.get<{ student: User }>("/api/auth/me", { token });
    setUser(res.student);
    router.push("/dashboard");
  }, [router]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post<{ token: string; student: User }>("/api/auth/login", {
        email,
        password,
      });
      localStorage.setItem("UniKit_token", res.token);
      setUser(res.student);
      router.push("/dashboard");
    },
    [router]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const res = await api.post<{ token: string; student: User }>("/api/auth/register", payload);
      localStorage.setItem("UniKit_token", res.token);
      setUser(res.student);
      router.push("/dashboard");
    },
    [router]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("UniKit_token");
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, devLogin }}>
      {children}
    </AuthContext.Provider>
  );
}
