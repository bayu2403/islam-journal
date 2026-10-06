import { ArrowLeft } from "lucide-react";

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
    <header className="fk-top z-40">
      {onBack && (
        <button type="button" className="fk-btn fk-btn-ghost icon sm" onClick={onBack} aria-label={backLabel}>
          <ArrowLeft className="fk-i" />
        </button>
      )}
      <h1 className="ttl">{title}</h1>
    </header>
  );
}
