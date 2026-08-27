import { cookies } from "next/headers";

export const ADMIN_COOKIE = "admin_auth";

/**
 * The configured admin password, or null when ADMIN_PASSWORD is unset.
 *
 * There is deliberately no fallback value. This repository is public, so a
 * default password here would be a published credential for /admin.
 */
export function adminPassword(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  return password ? password : null;
}

/** True only when a password is configured and the submitted one matches. */
export function passwordMatches(submitted: unknown): boolean {
  const expected = adminPassword();
  if (!expected) return false;
  return typeof submitted === "string" && submitted === expected;
}

/**
 * True only when a password is configured and the request carries it.
 *
 * Comparing the cookie against the password directly would authenticate
 * everyone if ADMIN_PASSWORD were ever unset, since a missing cookie and a
 * missing password are both undefined. Failing closed here avoids that.
 */
export async function isAdminAuthed(): Promise<boolean> {
  const expected = adminPassword();
  if (!expected) return false;
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === expected;
}
