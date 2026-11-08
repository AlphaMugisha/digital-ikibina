import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      // Next.js ships `server.js` without an `exports` map entry, so Vitest's
      // ESM resolver cannot load the extensionless specifier that next-auth
      // uses internally. Next itself resolves it fine at build/run time.
      "next/server": path.resolve(__dirname, "node_modules/next/server.js"),
    },
  },
  test: {
    environment: "node",
    server: {
      deps: {
        // next-auth imports the extensionless `next/server`, which Vitest's
        // ESM resolver cannot load from an externalized dependency. Inlining
        // next-auth routes it through the alias above instead.
        inline: ["next-auth", "@auth/core"],
      },
    },
  },
});
