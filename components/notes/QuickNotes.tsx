"use client";

import { useState, useTransition, useRef } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { addQuickNote, deleteQuickNote } from "@/app/(app)/notes/actions";
import type { Note } from "@/lib/types";
import { SectionHeader } from "./SectionHeader";

export function QuickNotes({ notes }: { notes: Note[] }) {
  const [pending, startTransition] = useTransition();
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    const fd = new FormData();
    fd.set("text", value);
    startTransition(async () => {
      try {
        await addQuickNote(fd);
        setText("");
        inputRef.current?.focus();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Speichern fehlgeschlagen");
      }
    });
  }

  function onDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteQuickNote(id);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Löschen fehlgeschlagen");
      }
    });
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
              disabled={pending}
            />
            <Button type="submit" disabled={pending || !text.trim()}>
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
                        <Badge key={t} variant="muted">
                          #{t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDelete(n.id)}
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-muted-foreground hover:text-danger transition-opacity"
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
