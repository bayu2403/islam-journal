"use client";

import { useEffect } from "react";

// Root fallback. In dev/server mode the next-intl middleware rewrites "/" to the
// locale route, so this is only reached in the static GitHub Pages export.
export default function RootRedirect() {
  const target = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/id/`;
  useEffect(() => {
    window.location.replace(target);
  }, [target]);
  return (
    <a href={target} style={{ padding: 24, display: "block" }}>
      Muslim Berislam →
    </a>
  );
}
