"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { api, todayStr } from "@/lib/api";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

// Falak FAB → quick-add sheet (dunia, today only).
export default function QuickAdd({ onAdded }: { onAdded: () => void }) {
  const t = useTranslations("Dashboard");
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!title.trim()) return;
    setBusy(true);
    try {
      await api("/todos", {
        method: "POST",
        body: JSON.stringify({
          custom_title: title.trim(),
          recurrence: "once",
          once_date: todayStr(),
          source: "quick_add",
          category: "dunia",
        }),
      });
      setTitle("");
      setOpen(false);
      onAdded();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<button type="button" className="fk-fab pointer-events-auto" aria-label={t("quickAddTitle")} />}>
        <Plus className="fk-i" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <span className="fk-hud fk-muted">{t("dunia")}</span>
          <DialogTitle>{t("quickAddTitle")}</DialogTitle>
        </DialogHeader>
        <div className="fk-field">
          <Input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={t("quickAddPlaceholder")}
          />
          <span className="fk-help">{t("quickAddHint")}</span>
        </div>
        <DialogFooter>
          <button type="button" className="fk-btn fk-btn-outline" onClick={() => setOpen(false)}>
            {t("cancel")}
          </button>
          <button type="button" className="fk-btn fk-btn-primary" onClick={submit} disabled={busy || !title.trim()}>
            {t("add")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
