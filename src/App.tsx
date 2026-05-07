import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { isSupabaseConfigured } from "@/integrations/supabase/client";

import Index from "./pages/Index.tsx";
import Habits from "./pages/Habits.tsx";
import Money from "./pages/Money.tsx";
import Notes from "./pages/Notes.tsx";
import Body from "./pages/Body.tsx";
import PlaceholderPage from "./pages/PlaceholderPage.tsx";
import Login from "./pages/Login.tsx";
import AuthCallback from "./pages/AuthCallback.tsx";
import Setup from "./pages/Setup.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Daten 30 Sek frisch halten — vermeidet Refetches bei jedem Tab-Wechsel
      staleTime: 30_000,
      // 1 Retry bei Netzwerkfehler, sonst nicht
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/setup" element={<Setup />} />

            {/* Protected app routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/habits"
              element={
                <ProtectedRoute>
                  <Habits />
                </ProtectedRoute>
              }
            />
            <Route
              path="/money"
              element={
                <ProtectedRoute>
                  <Money />
                </ProtectedRoute>
              }
            />
            <Route
              path="/body"
              element={
                <ProtectedRoute>
                  <Body />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notes"
              element={
                <ProtectedRoute>
                  <Notes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <PlaceholderPage
                    title="Einstellungen"
                    emoji="⚙️"
                    subtitle="Habits verwalten, Theme, Datenexport — kommt in Etappe 2c."
                  />
                </ProtectedRoute>
              }
            />

            {/* Auto-fallback wenn Supabase nicht konfiguriert ist (Setup wird via ProtectedRoute erreicht) */}
            {!isSupabaseConfigured && (
              <Route path="*" element={<Navigate to="/setup" replace />} />
            )}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
