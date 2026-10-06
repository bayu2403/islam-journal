"use client";

import { useEffect } from "react";

// Falak press ripple: any .fk-pill / .fk-btn gets a span.fk-ripple at the pointer.
export default function FalakEffects() {
  useEffect(() => {
    function onDown(e: PointerEvent) {
      const t = (e.target as Element | null)?.closest?.(".fk-pill, .fk-btn") as HTMLElement | null;
      if (!t || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const r = t.getBoundingClientRect();
      const s = document.createElement("span");
      s.className = "fk-ripple";
      s.style.left = `${e.clientX - r.left}px`;
      s.style.top = `${e.clientY - r.top}px`;
      t.appendChild(s);
      setTimeout(() => s.remove(), 650);
    }
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);
  return null;
}
