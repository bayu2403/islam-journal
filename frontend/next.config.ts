import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

// GitHub Pages build (see .github/workflows/deploy.yml): fully static export
// served from /<repo>. Normal dev/start builds are unaffected.
const isPages = process.env.GITHUB_PAGES === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = isPages
  ? {
      output: "export",
      trailingSlash: true,
      basePath,
      images: { unoptimized: true },
    }
  : {};

export default withNextIntl(nextConfig);
