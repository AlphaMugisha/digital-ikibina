import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Hide the dev-mode "compiling…" on-screen indicator — we show our own
  // branded loading screen (app/loading.tsx) instead.
  devIndicators: false,
};

export default withNextIntl(nextConfig);
