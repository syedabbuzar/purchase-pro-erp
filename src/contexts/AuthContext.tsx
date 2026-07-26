import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { clearSession, decodeSessionFromToken, type Session } from "@/lib/authStore";

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  setSession: (s: Session | null) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  loading: true,
  setSession: () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Rehydrate from the JWT stored in localStorage (token only).
    setSession(decodeSessionFromToken());
    setLoading(false);
  }, []);

  const signOut = () => {
    clearSession();
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, loading, setSession, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
