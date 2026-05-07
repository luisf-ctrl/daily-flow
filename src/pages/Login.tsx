import { useState, useEffect, FormEvent } from "react";
import { useSearchParams, Navigate, useLocation } from "react-router-dom";
import { Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

const DEFAULT_EMAIL = (import.meta.env.VITE_DEFAULT_LOGIN_EMAIL as
  | string
  | undefined) ?? "";

type LocationState = { from?: { pathname?: string } } | undefined;

export default function Login() {
  const { user, isAuthorized, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const errorParam = searchParams.get("error");
  const location = useLocation();
  const state = location.state as LocationState;
  const redirectTo = state?.from?.pathname ?? "/";

  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");
  const { signInWithEmail } = useAuth();

  // Bei Fokus auf das Feld nach Mount
  useEffect(() => {
    if (!email) {
      const el = document.getElementById("email") as HTMLInputElement | null;
      el?.focus();
    }
  }, [email]);

  // Wenn schon eingeloggt + autorisiert, direkt redirecten
  if (!loading && user && isAuthorized) {
    return <Navigate to={redirectTo} replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    const { error } = await signInWithEmail(email);
    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }
    setStatus("sent");
    setMessage(`Magic Link an ${email} geschickt — Postfach checken.`);
  }

  return (
    <div className="min-h-screen grid place-items-center px-6 py-12 bg-background">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Flame className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Daily Flow</h1>
          <p className="text-sm text-muted-foreground">
            Persönlicher Habit- &amp; Lebens-Tracker
          </p>
        </div>

        <Card>
          <CardContent className="pt-8">
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="dein@email.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "loading" || status === "sent"}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={status === "loading" || status === "sent" || !email}
              >
                {status === "loading"
                  ? "Sende Link..."
                  : status === "sent"
                    ? "Link gesendet ✓"
                    : "Magic Link schicken"}
              </Button>
            </form>

            {errorParam === "not_authorized" && (
              <p className="mt-4 text-sm text-destructive">
                Diese E-Mail-Adresse ist nicht autorisiert.
              </p>
            )}
            {message && status === "sent" && (
              <p className="mt-4 text-sm text-success">{message}</p>
            )}
            {message && status === "error" && (
              <p className="mt-4 text-sm text-destructive">{message}</p>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Single-User Mode — nur autorisierte E-Mail kann sich einloggen.
        </p>
      </div>
    </div>
  );
}
