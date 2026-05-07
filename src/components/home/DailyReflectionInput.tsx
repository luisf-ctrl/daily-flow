import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, uid } from "@/lib/db";
import { todayKey } from "@/lib/streak";
import { Textarea } from "@/components/ui/textarea";

export function DailyReflectionInput() {
  const today = todayKey();
  const reflection = useLiveQuery(() => db.reflections.where("date").equals(today).first(), [today]);
  const [val, setVal] = useState("");

  useEffect(() => {
    setVal(reflection?.best_of_day ?? "");
  }, [reflection?.id]);

  const save = async (text: string) => {
    setVal(text);
    if (reflection) {
      await db.reflections.update(reflection.id, { best_of_day: text });
    } else {
      await db.reflections.add({
        id: uid(),
        date: today,
        best_of_day: text,
        created_at: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="surface">
      <p className="label-caps mb-3">Heutige Reflexion</p>
      <Textarea
        value={val}
        onChange={(e) => save(e.target.value)}
        placeholder="Was war das Beste am heutigen Tag?"
        className="bg-transparent border-white/[0.06] resize-none min-h-[80px] focus-visible:ring-primary/40"
      />
    </div>
  );
}
