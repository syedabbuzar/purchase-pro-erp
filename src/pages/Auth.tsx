import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { ensureSeed } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

function AuthPage() {
  const navigate = useNavigate();
  const login = useAuth((s) => s.login);
  const session = useAuth((s) => s.session);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [loading, setLoading] = useState(false);

  useEffect(() => { ensureSeed().catch(console.error); }, []);
  useEffect(() => {
    if (session && session.expiresAt > Date.now()) navigate("/dashboard");
  }, [session, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(username, password);
    setLoading(false);
    if (res.ok) {
      toast.success("Welcome back");
      navigate("/dashboard");
    } else {
      toast.error(res.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary to-accent/40 px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto h-14 w-14 rounded-xl bg-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
            S
          </div>
          <CardTitle className="text-2xl">STAR ENTERPRISES</CardTitle>
          <CardDescription>GST Billing & Stock Management ERP</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="u">Username</Label>
              <Input id="u" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p">Password</Label>
              <Input id="p" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Default: <b>admin</b> / <b>admin</b> — change after first login.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
