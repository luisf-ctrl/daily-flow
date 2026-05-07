import { useState, useRef, FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Note } from "@/integrations/supabase/types";
import { SectionHeader } from "./SectionHeader";

// Tags aus #word im Body parsen — bewusst ohne Unicode-Property-Escapes
function parseTags(text: string): string[] {
  const matches = text.match(/#[\wäöüÄÖÜß-]+/g) ?? [];
  return Array.from(new Set(matches.map((t) => t.slice(1).toLowerCase())));
}

export function QuickNotes() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: notes = [] } = useQuery({
    queryKey: ["quick-notes"],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("type", "quick")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as Note[];
    },
  });

  const add = useMutation({
    mutationFn: async (rawText: string) => {
      if (!user) throw new Error("Nicht eingeloggt");
      const tags = parseTags(rawText);
      const { error } = await supabase.from("notes").insert({
        user_id: user.id,
        type: "quick",
        title: null,
        body_md: rawText,
        tags,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setText("");
      inputRef.current?.focus();
      queryClient.invalidateQueries({ queryKey: ["quick-notes"] });
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Speichern fehlgeschlagen");
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quick-notes"] });
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Löschen fehlgeschlagen");
    },
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    add.mutate(value);
  }

  return (
    <section>
      <SectionHeader label="Inbox" title="Quick Notes" />
      <Card>
        <CardContent className="pt-6 space-y-4">
          <form onSubmit={onSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Gedanken loswerden... (#tag)"
              aria-label="Neue Quick Note"
              disabled={add.isPending}
            />
            <Button type="submit" disabled={add.isPending || !text.trim()}>
              Hinzufügen
            </Button>
          </form>

          {notes.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Noch keine Notes. Ein Gedanke pro Zeile, später taggst du sie mit
              <code className="mx-1 rounded bg-white/[0.04] px-1 py-0.5 font-mono text-xs">
                #tag
              </code>
              direkt im Text.
            </p>
          ) : (
            <ul className="divide-y divide-white/[0.04]">
              {notes.map((n) => (
                <li
                  key={n.id}
                  className="group flex items-start gap-3 py-3 first:pt-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {n.body_md}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] text-muted-foreground">
                        {format(new Date(n.created_at), "d. MMM, HH:mm", {
                          locale: de,
                        })}
                      </span>
                      {n.tags.map((t) => (
                        <Badge key={t} variant="secondary">
                          #{t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove.mutate(n.id)}
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                    aria-label="Note löschen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
