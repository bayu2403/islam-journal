import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TopBar({
  title,
  onBack,
  backLabel = "Back",
}: {
  title: string;
  onBack?: () => void;
  backLabel?: string;
}) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-12 max-w-md items-center gap-1 px-2">
        {onBack && (
          <Button variant="ghost" size="icon-sm" onClick={onBack} aria-label={backLabel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <h1 className={`text-base font-semibold ${onBack ? "px-1" : "px-2"}`}>{title}</h1>
      </div>
    </header>
  );
}
