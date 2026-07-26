// Auth store — backend-driven.
// All user/OTP/session data lives on the server. The only thing kept
// in localStorage is the JWT `token`, which the axios interceptor
// attaches to every authenticated request.

import { getToken, clearToken, setToken, type AuthUser } from "./api";

export interface Session {
  email: string;
  name: string;
  role: "user" | "admin";
}

// Decode JWT payload (base64) without verifying — used only to
// reconstruct the current session on page reload from the token itself.
export function decodeSessionFromToken(): Session | null {
  const token = getToken();
  if (!token) return null;
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const json = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );
    if (!json?.email) return null;
    // Expiry check
    if (json.exp && Date.now() / 1000 > json.exp) {
      clearToken();
      return null;
    }
    return {
      email: String(json.email).toLowerCase(),
      name: json.name || "",
      role: json.role === "admin" ? "admin" : "user",
    };
  } catch {
    return null;
  }
}

export function saveAuth(token: string, user: Pick<AuthUser, "email" | "name" | "role">): Session {
  setToken(token);
  return {
    email: user.email.toLowerCase(),
    name: user.name || "",
    role: user.role === "admin" ? "admin" : "user",
  };
}

export function clearSession() {
  clearToken();
}
