import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db, uid, type HabitFrequency } from "@/lib/db";

export function NewHabitDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("✨");
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState("");
  const [frequency, setFrequency] = useState<HabitFrequency>("daily");

  const submit = async () => {
    if (!name.trim()) return;
    const max = await db.habits.orderBy("sort").last();
    await db.habits.add({
      id: uid(),
      name: name.trim(),
      icon,
      target_value: target ? Number(target) : undefined,
      unit: unit || undefined,
      frequency,
      archived: 0,
      created_at: new Date().toISOString(),
      sort: (max?.sort ?? 0) + 1,
    });
    setName(""); setIcon("✨"); setTarget(""); setUnit(""); setFrequency("daily");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" /> Neuer Habit
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-white/[0.06]">
        <DialogHeader>
          <DialogTitle>Neuen Habit erstellen</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-[80px_1fr] gap-3">
            <div>
              <Label>Icon</Label>
              <Input value={icon} onChange={(e) => setIcon(e.target.value)} maxLength={2} className="text-center text-xl" />
            </div>
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="z.B. Tagebuch schreiben" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Ziel</Label>
              <Input type="number" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="20" />
            </div>
            <div>
              <Label>Einheit</Label>
              <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Seiten" />
            </div>
          </div>
          <div>
            <Label>Frequenz</Label>
            <Select value={frequency} onValueChange={(v) => setFrequency(v as HabitFrequency)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Täglich</SelectItem>
                <SelectItem value="weekly_3">3× pro Woche</SelectItem>
                <SelectItem value="weekly_4">4× pro Woche</SelectItem>
                <SelectItem value="weekly_5">5× pro Woche</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} className="bg-primary text-primary-foreground hover:bg-primary/90">Anlegen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
