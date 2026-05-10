"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Role } from "@/types/app";

export interface AuthUser {
  id: string;
  name: string;
  displayName: string;
  role: Role;
}

interface StoredAccount extends AuthUser {
  password: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (name: string, password: string) => string | null;
  signup: (name: string, displayName: string, role: Role, password: string) => string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ACCOUNTS_KEY = "fc_accounts";
const SESSION_KEY  = "fc_session";

function loadAccounts(): StoredAccount[] {
  try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? "[]"); }
  catch { return []; }
}

function saveAccounts(accounts: StoredAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function loadSession(): AuthUser | null {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) ?? "null"); }
  catch { return null; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(loadSession());
    setLoading(false);
  }, []);

  const login = (name: string, password: string): string | null => {
    const accounts = loadAccounts();
    const account  = accounts.find((a) => a.name.toLowerCase() === name.toLowerCase());
    if (!account)                      return "名前が登録されていません";
    if (account.password !== password) return "パスワードが正しくありません";
    const { password: _, ...authUser } = account;
    localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
    setUser(authUser);
    return null;
  };

  const signup = (
    name: string,
    displayName: string,
    role: Role,
    password: string
  ): string | null => {
    const accounts = loadAccounts();
    if (accounts.find((a) => a.name.toLowerCase() === name.toLowerCase())) {
      return "この名前はすでに登録されています";
    }
    const newAccount: StoredAccount = {
      id: `user-${Date.now()}`,
      name,
      displayName,
      role,
      password,
    };
    saveAccounts([...accounts, newAccount]);
    const { password: _, ...authUser } = newAccount;
    localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
    setUser(authUser);
    return null;
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
