"use client";

import { useLayoutEffect, useRef } from "react";

// Gliding indicator for .fk-seg / .fk-dock: moves the container's .ind under the
// active child ([aria-pressed|aria-selected="true"] or [aria-current="page"]).
export function useGlide<T extends HTMLElement>(dep: unknown) {
  const ref = useRef<T>(null);
  useLayoutEffect(() => {
    const g = ref.current;
    if (!g) return;
    const ind = g.querySelector<HTMLElement>(".ind");
    if (!ind) return;
    function place() {
      if (!g || !ind) return;
      const a = g.querySelector<HTMLElement>('[aria-selected="true"], [aria-pressed="true"], [aria-current="page"]');
      if (!a) {
        ind.style.opacity = "0";
        return;
      }
      ind.style.opacity = "1";
      ind.style.width = `${a.offsetWidth}px`;
      ind.style.transform = `translateX(${a.offsetLeft - parseFloat(getComputedStyle(ind).left)}px)`;
    }
    place();
    document.fonts?.ready.then(place);
    const ro = new ResizeObserver(place);
    ro.observe(g);
    return () => ro.disconnect();
  }, [dep]);
  return ref;
}
