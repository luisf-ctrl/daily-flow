import { Suspense } from "react";
import { Flame } from "lucide-react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-svh grid place-items-center px-6 py-12 bg-background">
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

        <Suspense fallback={<div className="h-48" />}>
          <LoginForm />
        </Suspense>

        <p className="text-center text-xs text-muted-foreground">
          Single-User Mode — nur autorisierte E-Mail kann sich einloggen.
        </p>
      </div>
    </div>
  );
}
