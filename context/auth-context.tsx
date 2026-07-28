"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";

export interface AuthUser {
  name: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function emitChange() {
  listeners.forEach((callback) => callback());
}

function getSnapshot(): string | null {
  return localStorage.getItem("av_user");
}

function getServerSnapshot(): string | null {
  return null;
}

function parseUser(raw: string | null): AuthUser | null {
  try {
    return JSON.parse(raw || "null");
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const user = parseUser(raw);

  const login = (u: AuthUser) => {
    localStorage.setItem("av_user", JSON.stringify(u));
    emitChange();
  };

  const signOut = () => {
    localStorage.removeItem("av_user");
    emitChange();
  };

  return (
    <AuthContext.Provider value={{ user, login, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
