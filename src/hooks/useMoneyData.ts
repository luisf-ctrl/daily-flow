import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { startOfMonth, endOfMonth } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type {
  HousePurchasePlan,
  Transaction,
} from "@/integrations/supabase/types";

// =============================================================================
// House Purchase Plan
// =============================================================================

export function useHousePurchasePlan() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["house-plan"],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("house_purchase_plan")
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as HousePurchasePlan | null;
    },
  });
}

export function useUpsertHousePurchasePlan() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<HousePurchasePlan, "user_id" | "created_at" | "updated_at">) => {
      if (!user) throw new Error("Nicht eingeloggt");
      const { error } = await supabase
        .from("house_purchase_plan")
        .upsert({ user_id: user.id, ...input }, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Plan gespeichert");
      queryClient.invalidateQueries({ queryKey: ["house-plan"] });
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Fehler");
    },
  });
}

// =============================================================================
// Savings Logs (transactions of type 'saving')
// =============================================================================

export function useSavings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["savings"],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("type", "saving")
        .order("date", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as Transaction[];
    },
  });
}

export function useMonthlySavingsTotal() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["savings-monthly-total"],
    enabled: Boolean(user),
    queryFn: async () => {
      const monthStart = startOfMonth(new Date()).toISOString().slice(0, 10);
      const monthEnd = endOfMonth(new Date()).toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("transactions")
        .select("amount")
        .eq("type", "saving")
        .gte("date", monthStart)
        .lte("date", monthEnd);
      if (error) throw error;
      return (data ?? []).reduce(
        (sum, row) => sum + Number(row.amount ?? 0),
        0,
      );
    },
  });
}

export function useAddSaving() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      amount: number;
      category: string | null;
      note: string | null;
    }) => {
      if (!user) throw new Error("Nicht eingeloggt");
      const today = new Date().toISOString().slice(0, 10);

      const { error: txError } = await supabase.from("transactions").insert({
        user_id: user.id,
        date: today,
        amount: input.amount,
        type: "saving",
        category: input.category,
        note: input.note,
      });
      if (txError) throw txError;

      // EK im Plan inkrementieren
      const { data: plan } = await supabase
        .from("house_purchase_plan")
        .select("existing_equity")
        .eq("user_id", user.id)
        .maybeSingle();
      if (plan) {
        const newEquity = Number(plan.existing_equity ?? 0) + input.amount;
        await supabase
          .from("house_purchase_plan")
          .update({ existing_equity: newEquity })
          .eq("user_id", user.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings"] });
      queryClient.invalidateQueries({ queryKey: ["savings-monthly-total"] });
      queryClient.invalidateQueries({ queryKey: ["house-plan"] });
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Fehler");
    },
  });
}

export function useDeleteSaving() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; amount: number }) => {
      if (!user) throw new Error("Nicht eingeloggt");
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", input.id);
      if (error) throw error;

      const { data: plan } = await supabase
        .from("house_purchase_plan")
        .select("existing_equity")
        .eq("user_id", user.id)
        .maybeSingle();
      if (plan) {
        const newEquity = Math.max(
          0,
          Number(plan.existing_equity ?? 0) - input.amount,
        );
        await supabase
          .from("house_purchase_plan")
          .update({ existing_equity: newEquity })
          .eq("user_id", user.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings"] });
      queryClient.invalidateQueries({ queryKey: ["savings-monthly-total"] });
      queryClient.invalidateQueries({ queryKey: ["house-plan"] });
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Fehler");
    },
  });
}
