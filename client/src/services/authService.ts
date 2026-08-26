import { api } from "./api";
import type { SessionUser } from "../types";

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const data = await api<{ user: SessionUser }>("/auth/me");
    return data.user;
  } catch {
    return null;
  }
}

export interface LoginResult {
  success: boolean;
  message?: string;
  user?: SessionUser;
}

export function login(userUsername: string, userPassword: string): Promise<LoginResult> {
  return api<LoginResult>("/login", {
    method: "POST",
    body: { userUsername, userPassword },
  });
}

export function logout(): Promise<{ success: boolean; message: string }> {
  return api("/logout", { method: "POST" });
}
