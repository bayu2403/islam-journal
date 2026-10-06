import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Muslim Berislam",
    short_name: "Berislam",
    description: "Temani perjalanan spiritualmu",
    start_url: `${base}/`,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1d5c4f",
    icons: [
      { src: `${base}/icon-192.png`, sizes: "192x192", type: "image/png" },
      { src: `${base}/icon-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
