"use client";

import { useGlide } from "./use-glide";
import { cn } from "@/lib/utils";

// Falak segmented control with gliding indicator.
export default function Segmented<V extends string>({
  value,
  options,
  onChange,
  label,
  full,
}: {
  value: V;
  options: { value: V; label: React.ReactNode }[];
  onChange: (v: V) => void;
  label: string;
  full?: boolean;
}) {
  const ref = useGlide<HTMLDivElement>(value);
  return (
    <div ref={ref} className={cn("fk-seg", full && "full")} role="group" aria-label={label}>
      <span className="ind" aria-hidden="true" />
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
