export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { checkAuthSecret } = await import("@/lib/auth-check");
    checkAuthSecret();

    const { ensureDatabaseReady } = await import("@/lib/db-check");
    await ensureDatabaseReady();
  }
}
