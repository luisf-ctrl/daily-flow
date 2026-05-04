"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export function LoginForm() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const [email, setEmail] = useState(
    process.env.NEXT_PUBLIC_DEFAULT_LOGIN_EMAIL ?? "",
  );
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string>("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }
    setStatus("sent");
    setMessage(`Magic Link an ${email} geschickt — Postfach checken.`);
  }

  return (
    <Card>
      <CardContent className="pt-8">
        <form onSubmit={handleSubmit} className="space-y-4">
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
            disabled={status === "loading" || status === "sent"}
          >
            {status === "loading"
              ? "Sende Link..."
              : status === "sent"
                ? "Link gesendet ✓"
                : "Magic Link schicken"}
          </Button>
        </form>

        {errorParam === "not_authorized" && (
          <p className="mt-4 text-sm text-danger">
            Diese E-Mail-Adresse ist nicht autorisiert.
          </p>
        )}
        {message && status === "sent" && (
          <p className="mt-4 text-sm text-success">{message}</p>
        )}
        {message && status === "error" && (
          <p className="mt-4 text-sm text-danger">{message}</p>
        )}
      </CardContent>
    </Card>
  );
}
