import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { isSupabaseConfigured } from "@/integrations/supabase/client";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthorized, signOut } = useAuth();
  const location = useLocation();

  // 1. Supabase nicht konfiguriert → Setup-Page
  if (!isSupabaseConfigured) {
    return <Navigate to="/setup" replace state={{ from: location }} />;
  }

  // 2. Auth-Status wird geladen → minimaler Skeleton
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="text-sm text-muted-foreground">Lade...</div>
      </div>
    );
  }

  // 3. Nicht eingeloggt → Login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 4. Eingeloggt aber nicht autorisiert (ADMIN_EMAIL stimmt nicht) → ausloggen + Login mit Fehler
  if (!isAuthorized) {
    void signOut();
    return (
      <Navigate to="/login?error=not_authorized" replace state={{ from: location }} />
    );
  }

  return <>{children}</>;
}
