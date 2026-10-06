"use client";

import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export type DalilTask = {
  title: string;
  is_system_title: boolean;
  dalil: string | null;
};

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
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("dalilTitle")}</DialogTitle>
        </DialogHeader>
        <p className="text-sm font-semibold">{title}</p>
        <p className="whitespace-pre-line text-sm text-muted-foreground">
          {task?.dalil ?? ""}
        </p>
      </DialogContent>
    </Dialog>
  );
}
