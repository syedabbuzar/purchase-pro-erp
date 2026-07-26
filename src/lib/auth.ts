import bcrypt from "bcryptjs";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { db, type Role } from "./db";

interface Session {
  userId: number;
  name: string;
  username: string;
  role: Role;
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
        const u = await db.users.where("username").equals(username.trim()).first();
        if (!u) return { ok: false, error: "Invalid credentials" };
        const ok = await bcrypt.compare(password, u.passwordHash);
        if (!ok) return { ok: false, error: "Invalid credentials" };
        set({
          session: {
            userId: u.id!,
            name: u.name,
            username: u.username,
            role: u.role,
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
          },
        });
        return { ok: true };
      },
      logout: () => set({ session: null }),
      isAuthed: () => {
        const s = get().session;
        return !!s && s.expiresAt > Date.now();
      },
      has: (roles) => {
        const s = get().session;
        return !!s && roles.includes(s.role);
      },
    }),
    { name: "star-erp-auth" },
  ),
);
