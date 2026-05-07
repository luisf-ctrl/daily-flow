import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";

// Magic-Link callback. Supabase JS SDK detected die ?code=... in der URL
// automatisch (detectSessionInUrl: true) und tauscht sie gegen eine Session.
// Hier warten wir kurz darauf und redirecten dann.
export default function AuthCallback() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setError("Supabase nicht konfiguriert");
      setDone(true);
      return;
    }

    let cancelled = false;
    (async () => {
      // Kurz warten, damit das SDK die URL parsen kann
      const { data, error: getErr } = await supabase.auth.getSession();
      if (cancelled) return;
      if (getErr) {
        setError(getErr.message);
      } else if (!data.session) {
        // Falls die URL nicht automatisch geparst wurde, manuell triggern
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        if (code) {
          const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
          if (exErr) setError(exErr.message);
        }
      }
      setDone(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!done) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="text-sm text-muted-foreground">Login wird abgeschlossen...</div>
      </div>
    );
  }

  if (error) {
    return <Navigate to={`/login?error=auth_failed`} replace />;
  }

  return <Navigate to="/" replace />;
}
