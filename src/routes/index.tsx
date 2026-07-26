import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem("star-erp-auth");
      try {
        const parsed = raw ? JSON.parse(raw) : null;
        const s = parsed?.state?.session;
        if (s && s.expiresAt > Date.now()) throw redirect({ to: "/dashboard" });
      } catch (e) {
        if ((e as { isRedirect?: boolean })?.isRedirect) throw e;
      }
    }
    throw redirect({ to: "/auth" });
  },
  component: () => null,
});
