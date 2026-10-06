"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Segmented from "@/components/falak/segmented";

export type Recurrence =
  | { recurrence: "once"; once_date: string }
  | { recurrence: "daily" }
  | { recurrence: "weekly"; weekly_days: number[] };

function tomorrowStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type Mode = "tomorrow" | "daily" | "weekly" | "date";

export default function RecurrencePicker({
  open, onClose, onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (r: Recurrence) => void;
}) {
  const t = useTranslations("Journal");
  const [mode, setMode] = useState<Mode>("tomorrow");
  const [days, setDays] = useState<number[]>([]);
  const [date, setDate] = useState(tomorrowStr());

  function confirm() {
    if (mode === "tomorrow") onPick({ recurrence: "once", once_date: tomorrowStr() });
    else if (mode === "daily") onPick({ recurrence: "daily" });
    else if (mode === "weekly" && days.length > 0) onPick({ recurrence: "weekly", weekly_days: days });
    else if (mode === "date") onPick({ recurrence: "once", once_date: date });
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("recurrenceTitle")}</DialogTitle>
        </DialogHeader>
        <Segmented<Mode>
          full
          label={t("recurrenceTitle")}
          value={mode}
          onChange={setMode}
          options={[
            { value: "tomorrow", label: t("tomorrow") },
            { value: "daily", label: t("daily") },
            { value: "weekly", label: t("weekly") },
            { value: "date", label: t("pickDate") },
          ]}
        />
        {mode === "weekly" && (
          <div className="fk-dow">
            {[1, 2, 3, 4, 5, 6, 0].map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={days.includes(d)}
                onClick={() =>
                  setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))
                }
              >
                {t(`days.${d}`)}
              </button>
            ))}
          </div>
        )}
        {mode === "date" && (
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        )}
        <DialogFooter>
          <button
            type="button"
            className="fk-btn fk-btn-primary"
            onClick={confirm}
            disabled={mode === "weekly" && days.length === 0}
          >
            {t("activate")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
