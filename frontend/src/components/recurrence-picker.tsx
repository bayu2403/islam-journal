"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export type Recurrence =
  | { recurrence: "once"; once_date: string }
  | { recurrence: "daily" }
  | { recurrence: "weekly"; weekly_days: number[] };

function tomorrowStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function RecurrencePicker({
  open, onClose, onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (r: Recurrence) => void;
}) {
  const t = useTranslations("Journal");
  const [mode, setMode] = useState<"tomorrow" | "daily" | "weekly" | "date">("tomorrow");
  const [days, setDays] = useState<number[]>([]);
  const [date, setDate] = useState(tomorrowStr());

  function confirm() {
    if (mode === "tomorrow") onPick({ recurrence: "once", once_date: tomorrowStr() });
    else if (mode === "daily") onPick({ recurrence: "daily" });
    else if (mode === "weekly" && days.length > 0) onPick({ recurrence: "weekly", weekly_days: days });
    else if (mode === "date") onPick({ recurrence: "once", once_date: date });
    onClose();
  }

  const modes = [
    { id: "tomorrow", label: t("tomorrow") },
    { id: "daily", label: t("daily") },
    { id: "weekly", label: t("weekly") },
    { id: "date", label: t("pickDate") },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("recurrenceTitle")}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2">
          {modes.map((m) => (
            <Button
              key={m.id}
              variant={mode === m.id ? "default" : "outline"}
              size="sm"
              onClick={() => setMode(m.id)}
            >
              {m.label}
            </Button>
          ))}
        </div>
        {mode === "weekly" && (
          <div className="flex flex-wrap gap-1.5">
            {[0, 1, 2, 3, 4, 5, 6].map((d) => (
              <Button
                key={d}
                size="sm"
                variant={days.includes(d) ? "default" : "outline"}
                className="w-11"
                onClick={() =>
                  setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))
                }
              >
                {t(`days.${d}`)}
              </Button>
            ))}
          </div>
        )}
        {mode === "date" && (
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        )}
        <DialogFooter>
          <Button onClick={confirm} disabled={mode === "weekly" && days.length === 0}>
            {t("activate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
