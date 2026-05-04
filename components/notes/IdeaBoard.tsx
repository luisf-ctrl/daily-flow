"use client";

import { useState, useTransition } from "react";
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
import { addIdea, updateIdeaStatus, deleteIdea } from "@/app/(app)/notes/actions";
import type { Idea, IdeaStatus } from "@/lib/types";
import { SectionHeader } from "./SectionHeader";

type Column = { status: IdeaStatus; label: string; color: string };

const COLUMNS: Column[] = [
  { status: "idea", label: "Idee", color: "text-muted-foreground" },
  { status: "validating", label: "Validierung", color: "text-warning" },
  { status: "building", label: "In Arbeit", color: "text-primary" },
  { status: "shipped", label: "Live", color: "text-success" },
  { status: "killed", label: "Verworfen", color: "text-danger" },
];

export function IdeaBoard({ ideas }: { ideas: Idea[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await addIdea(fd);
        toast.success("Idee gespeichert");
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Fehler");
      }
    });
  }

  function onStatusChange(id: string, status: IdeaStatus) {
    startTransition(async () => {
      try {
        await updateIdeaStatus(id, status);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Fehler");
      }
    });
  }

  function onDelete(id: string) {
    if (!confirm("Idee wirklich löschen?")) return;
    startTransition(async () => {
      try {
        await deleteIdea(id);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Fehler");
      }
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
                <Button type="submit" disabled={pending} className="w-full">
                  {pending ? "Speichere..." : "Idee speichern"}
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
                              onClick={() => onDelete(idea.id)}
                              className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-muted-foreground hover:text-danger transition-opacity"
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
                              onStatusChange(idea.id, v as IdeaStatus)
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
