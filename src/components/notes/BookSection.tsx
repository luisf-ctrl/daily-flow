import { useState, FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { toast } from "sonner";
import { BookOpen, Plus, Star, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import type { Book, BookStatus } from "@/integrations/supabase/types";
import { todayISO } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { SectionHeader } from "./SectionHeader";

const STATUS_LABELS: Record<BookStatus, string> = {
  reading: "Aktuell",
  finished: "Fertig",
  wishlist: "Wunschliste",
};

const STATUS_VARIANTS: Record<
  BookStatus,
  "default" | "secondary" | "outline"
> = {
  reading: "default",
  finished: "secondary",
  wishlist: "outline",
};

export function BookSection() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<BookStatus | "all">("all");

  const { data: books = [] } = useQuery({
    queryKey: ["books"],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Book[];
    },
  });

  const filtered = books.filter(
    (b) => filter === "all" || b.status === filter,
  );

  const add = useMutation({
    mutationFn: async (input: {
      title: string;
      author: string | null;
      status: BookStatus;
      rating: number | null;
      highlights_md: string | null;
    }) => {
      if (!user) throw new Error("Nicht eingeloggt");
      const today = todayISO();
      const startedAt = input.status === "wishlist" ? null : today;
      const finishedAt = input.status === "finished" ? today : null;
      const { error } = await supabase.from("books").insert({
        user_id: user.id,
        ...input,
        started_at: startedAt,
        finished_at: finishedAt,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Buch hinzugefügt");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Fehler");
    },
  });

  const updateStatus = useMutation({
    mutationFn: async (input: { id: string; status: BookStatus }) => {
      const today = todayISO();
      const patch: Record<string, unknown> = { status: input.status };
      if (input.status === "finished") patch.finished_at = today;
      if (input.status === "reading") patch.finished_at = null;
      const { error } = await supabase
        .from("books")
        .update(patch)
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Fehler");
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("books").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
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
      author: (fd.get("author") as string) || null,
      status: ((fd.get("status") as BookStatus) ?? "reading"),
      rating: fd.get("rating") ? Number(fd.get("rating")) : null,
      highlights_md: (fd.get("highlights_md") as string) || null,
    });
  }

  return (
    <section>
      <SectionHeader
        label="Knowledge Base"
        title="Bücher"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4" /> Hinzufügen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Neues Buch</DialogTitle>
              </DialogHeader>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="book-title">Titel *</Label>
                  <Input id="book-title" name="title" required autoFocus />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="book-author">Autor</Label>
                  <Input id="book-author" name="author" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select name="status" defaultValue="reading">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reading">Aktuell</SelectItem>
                        <SelectItem value="finished">Fertig</SelectItem>
                        <SelectItem value="wishlist">Wunschliste</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="book-rating">Rating (1–5)</Label>
                    <Input
                      id="book-rating"
                      name="rating"
                      type="number"
                      min={1}
                      max={5}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="book-highlights">Highlights (Markdown)</Label>
                  <Textarea
                    id="book-highlights"
                    name="highlights_md"
                    rows={4}
                    placeholder="Wichtigste Zitate, Ideen, Notizen..."
                  />
                </div>
                <Button
                  type="submit"
                  disabled={add.isPending}
                  className="w-full"
                >
                  {add.isPending ? "Speichere..." : "Buch speichern"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "reading", "finished", "wishlist"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition",
              filter === f
                ? "border-primary bg-primary/10 text-primary"
                : "border-white/[0.08] text-muted-foreground hover:text-foreground",
            )}
          >
            {f === "all" ? "Alle" : STATUS_LABELS[f]}
            <span className="ml-1.5 opacity-60">
              {f === "all"
                ? books.length
                : books.filter((b) => b.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="pt-8 pb-10 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">
              Noch keine Bücher in dieser Liste 📚
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => (
            <Card key={b.id} className="group flex flex-col">
              <CardContent className="pt-6 flex-1 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant={STATUS_VARIANTS[b.status]}>
                    {STATUS_LABELS[b.status]}
                  </Badge>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Buch wirklich löschen?")) remove.mutate(b.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                    aria-label="Buch löschen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold leading-tight">{b.title}</h3>
                  {b.author && (
                    <p className="text-sm text-muted-foreground">{b.author}</p>
                  )}
                </div>
                {b.rating && (
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3.5 w-3.5",
                          i < b.rating!
                            ? "fill-warning text-warning"
                            : "text-muted-foreground",
                        )}
                      />
                    ))}
                  </div>
                )}
                {b.highlights_md && (
                  <p className="line-clamp-3 text-xs text-muted-foreground whitespace-pre-wrap">
                    {b.highlights_md}
                  </p>
                )}
                {b.finished_at && (
                  <p className="text-[11px] text-muted-foreground">
                    Fertig{" "}
                    {format(new Date(b.finished_at), "d. MMM yyyy", {
                      locale: de,
                    })}
                  </p>
                )}
              </CardContent>
              <div className="border-t border-white/[0.04] p-3">
                <Select
                  value={b.status}
                  onValueChange={(v) =>
                    updateStatus.mutate({ id: b.id, status: v as BookStatus })
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reading">Aktuell</SelectItem>
                    <SelectItem value="finished">Fertig</SelectItem>
                    <SelectItem value="wishlist">Wunschliste</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
