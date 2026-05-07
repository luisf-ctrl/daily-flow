import { useState, FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Lightbulb, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Idea, IdeaStatus } from "@/integrations/supabase/types";
import { SectionHeader } from "./SectionHeader";

type Column = { status: IdeaStatus; label: string; color: string };

const COLUMNS: Column[] = [
  { status: "idea", label: "Idee", color: "text-muted-foreground" },
  { status: "validating", label: "Validierung", color: "text-warning" },
  { status: "building", label: "In Arbeit", color: "text-primary" },
  { status: "shipped", label: "Live", color: "text-success" },
  { status: "killed", label: "Verworfen", color: "text-destructive" },
];

export function IdeaBoard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: ideas = [] } = useQuery({
    queryKey: ["ideas"],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ideas")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Idea[];
    },
  });

  const add = useMutation({
    mutationFn: async (input: {
      title: string;
      description: string | null;
      status: IdeaStatus;
    }) => {
      if (!user) throw new Error("Nicht eingeloggt");
      const { error } = await supabase.from("ideas").insert({
        user_id: user.id,
        ...input,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Idee gespeichert");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Fehler");
    },
  });

  const updateStatus = useMutation({
    mutationFn: async (input: { id: string; status: IdeaStatus }) => {
      const { error } = await supabase
        .from("ideas")
        .update({ status: input.status })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Fehler");
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ideas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Fehler");
    },
  });

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    add.mutate({
      title: String(fd.get("title") ?? "").trim(),
      description: (fd.get("description") as string) || null,
      status: ((fd.get("status") as IdeaStatus) ?? "idea"),
    });
  }

  return (
    <section>
      <SectionHeader
        label="Backlog"
        title="Ideen"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4" /> Hinzufügen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Neue Idee</DialogTitle>
              </DialogHeader>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="idea-title">Titel *</Label>
                  <Input id="idea-title" name="title" required autoFocus />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idea-description">Beschreibung</Label>
                  <Textarea
                    id="idea-description"
                    name="description"
                    rows={4}
                    placeholder="Was, für wen, warum jetzt..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select name="status" defaultValue="idea">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COLUMNS.map((c) => (
                        <SelectItem key={c.status} value={c.status}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  disabled={add.isPending}
                  className="w-full"
                >
                  {add.isPending ? "Speichere..." : "Idee speichern"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {ideas.length === 0 ? (
        <Card>
          <CardContent className="pt-8 pb-10 text-center">
            <Lightbulb className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">
              Noch keine Ideen — was würdest du bauen, wenn du Zeit hättest? 💡
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {COLUMNS.map((col) => {
            const items = ideas.filter((i) => i.status === col.status);
            return (
              <div key={col.status} className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <p className={`label-caps ${col.color}`}>{col.label}</p>
                  <span className="font-mono text-xs text-muted-foreground">
                    {items.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {items.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-white/[0.04] p-4 text-center text-xs text-muted-foreground">
                      Leer
                    </div>
                  ) : (
                    items.map((idea) => (
                      <Card key={idea.id} className="group">
                        <CardContent className="pt-4 pb-4 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-medium text-sm leading-tight">
                              {idea.title}
                            </h3>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm("Idee wirklich löschen?"))
                                  remove.mutate(idea.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                              aria-label="Idee löschen"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          {idea.description && (
                            <p className="line-clamp-3 text-xs text-muted-foreground">
                              {idea.description}
                            </p>
                          )}
                          <Select
                            value={idea.status}
                            onValueChange={(v) =>
                              updateStatus.mutate({
                                id: idea.id,
                                status: v as IdeaStatus,
                              })
                            }
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {COLUMNS.map((c) => (
                                <SelectItem key={c.status} value={c.status}>
                                  {c.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
