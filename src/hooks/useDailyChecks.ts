import { useCallback, useEffect, useState } from "react";
import { db } from "@/lib/db";
import { todayISO } from "@/lib/dates";

/**
 * Local-first "Quick-Logs": speichert pro Tag eine Liste erledigter Item-IDs
 * im Dexie `settings`-Store unter dem Key `checks:YYYY-MM-DD`.
 * Kein Aufwand für den User → Tap oder Swipe genügt.
 */
export function useDailyChecks(date: string = todayISO()) {
  const key = `checks:${date}`;
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    db.settings.get(key).then((row) => {
      if (!active) return;
      const arr = (row?.value as string[] | undefined) ?? [];
      setChecked(new Set(arr));
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, [key]);

  const toggle = useCallback(
    (id: string) => {
      setChecked((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        db.settings.put({ key, value: Array.from(next) });
        return next;
      });
    },
    [key],
  );

  const isChecked = useCallback((id: string) => checked.has(id), [checked]);

  return { checked, isChecked, toggle, loaded };
}
