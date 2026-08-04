import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
const starLogo = "./star-logo.png";
const mellowMoonLogo = "./mellowmoon.png";

function AuthPage() {
  const navigate = useNavigate();
  const login = useAuth((s) => s.login);
  const session = useAuth((s) => s.session);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center bg-[#dce7d8] px-4 py-6">
      <Card className="w-full max-w-[660px] rounded-[20px] border border-black/10 bg-[#f5f5f5] shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
        <CardHeader className="px-8 pt-8 pb-5 text-center space-y-4">
          <div className="mx-auto flex w-full max-w-[300px] items-center justify-center rounded-[18px] bg-transparent p-2">
            <img src={starLogo} alt="STAR ENTERPRISES logo" className="h-auto w-full max-w-[260px] object-contain" />
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="u" className="text-[1.05rem] font-medium text-[#1f2f1f]">Username</Label>
              <Input id="u" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus className="h-12 rounded-[8px] border-[1.8px] border-[#1f8d32] bg-white text-base" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p" className="text-[1.05rem] font-medium text-[#1f2f1f]">Password</Label>
              <Input id="p" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-[8px] border-[1.8px] border-[#1f8d32] bg-white text-base" />
            </div>
            <Button type="submit" className="h-12 w-full rounded-[8px] bg-[#0f7c1b] text-[1.05rem] font-semibold" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
            <p className="text-[0.95rem] text-muted-foreground text-center">
              Sign in with your STAR ENTERPRISES admin account.
            </p>
          </form>

          <div className="mt-6 flex flex-col items-center gap-1 text-center text-[11px] text-muted-foreground">
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/80">Powered by</span>
            <img src={mellowMoonLogo} alt="MellowMoon SoftTech Pvt. Ltd." className="h-8 w-auto object-contain" />
            <span className="font-semibold text-foreground/80">MellowMoon SoftTech Pvt. Ltd.</span>
            <span className="text-[10px]">© 2026 MellowMoon SoftTech Pvt. Ltd. All Rights Reserved.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AuthPage;
