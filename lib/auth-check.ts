import "server-only";

const MIN_SECRET_LENGTH = 32;

/** Auth.js v5 reads `AUTH_SECRET`; `NEXTAUTH_SECRET` is the v4 name kept for
 * backwards compatibility. */
function readSecret(): string | undefined {
  return process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || undefined;
}

export function hasAuthSecret(): boolean {
  const secret = readSecret();
  return !!secret && secret.length >= MIN_SECRET_LENGTH;
}

/**
 * With no secret configured, Auth.js answers *every* request to
 * `/api/auth/*` with a `MissingSecret` -> `Configuration` error, so nobody can
 * log in or sign up — and the failure looks like wrong credentials from the
 * outside. Say so loudly at startup instead of leaving it to be guessed.
 */
export function checkAuthSecret() {
  const secret = readSecret();

  if (!secret) {
    console.error(
      "[auth-check] AUTH_SECRET is NOT SET — every login and signup will fail " +
        '("There was a problem with the server configuration"). Generate one with ' +
        "`npx auth secret` and add it to this environment, then redeploy.",
    );
    return;
  }

  if (secret.length < MIN_SECRET_LENGTH) {
    console.error(
      `[auth-check] AUTH_SECRET is only ${secret.length} characters — use at least ` +
        `${MIN_SECRET_LENGTH}. Generate one with \`npx auth secret\`.`,
    );
    return;
  }

  console.log("[auth-check] AUTH_SECRET present");
}
