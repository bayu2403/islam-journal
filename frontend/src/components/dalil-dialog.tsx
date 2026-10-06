"use client";

import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export type DalilTask = {
  title: string;
  is_system_title: boolean;
  dalil: string | null;
};

// Falak dalil sheet. Hadith text is religious content — rendered verbatim, never truncated.
export default function DalilDialog({
  task,
  open,
  onOpenChange,
}: {
  task: DalilTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("Dashboard");
  const sys = useTranslations();
  const title = task ? (task.is_system_title ? sys(task.title) : task.title) : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <span className="fk-hud" style={{ color: "var(--primary)" }}>{t("dalilTitle")}</span>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="fk-cite">
          <p className="m-0 whitespace-pre-line text-[15px] leading-6">{task?.dalil ?? ""}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
