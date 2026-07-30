import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loginApi } from "./services";
import { apiErrorMessage, setToken } from "./api";

export type Role = "admin";

interface Session {
  userId: string;
  name: string;
  username: string;
  role: Role;
  token: string;
  expiresAt: number;
}

interface AuthState {
  session: Session | null;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  isAuthed: () => boolean;
  has: (roles: Role[]) => boolean;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      login: async (username, password) => {
        try {
          const res = await loginApi(username.trim(), password);
          if (!res?.token) return { ok: false, error: res?.message || "Login failed" };
          set({
            session: {
              userId: res.data.id,
              name: res.data.username,
              username: res.data.username,
              role: "admin",
              token: res.token,
              expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
            },
          });
          return { ok: true };
        } catch (e) {
          return { ok: false, error: apiErrorMessage(e) };
        }
      },
      logout: () => {
        setToken(null);
        set({ session: null });
      },
      isAuthed: () => {
        const s = get().session;
        return !!s && s.expiresAt > Date.now();
      },
      has: (roles) => {
        const s = get().session;
        return !!s && roles.includes(s.role);
      },
    }),
    {
      name: "star-erp-auth",
      onRehydrateStorage: () => (state) => {
        if (state?.session?.token) setToken(state.session.token);
      },
    },
  ),
);
