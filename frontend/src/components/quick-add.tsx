"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { api, todayStr } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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
      <DialogTrigger render={<Button size="icon" className="rounded-full shadow-md" aria-label={t("quickAddTitle")} />}>
        <Plus className="h-5 w-5" />
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("quickAddTitle")}</DialogTitle>
        </DialogHeader>
        <Input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={t("quickAddPlaceholder")}
        />
        <p className="text-xs text-muted-foreground">{t("quickAddHint")}</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>{t("cancel")}</Button>
          <Button onClick={submit} disabled={busy || !title.trim()}>{t("add")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
