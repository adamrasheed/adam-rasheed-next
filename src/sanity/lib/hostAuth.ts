import "server-only";

import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const HOST_COOKIE = "bar_host";
export const HOST_COOKIE_MAX_AGE = 60 * 60 * 12; // one long night

/**
 * The cookie is a hash of the passcode, not the passcode itself, so a reused
 * passcode never sits in plaintext on the guest's machine. It is still a bearer
 * token: holding the cookie is equivalent to knowing the passcode, which is the
 * intended strength for a party console.
 */
export function hostCookieValue(passcode: string) {
  return createHash("sha256").update(`bar-host:${passcode}`).digest("hex");
}

export function getHostPasscode() {
  const passcode = process.env.BAR_HOST_PASSCODE;

  return typeof passcode === "string" && passcode.length > 0 ? passcode : null;
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) return false;

  return timingSafeEqual(left, right);
}

export function isPasscodeCorrect(candidate: string) {
  const passcode = getHostPasscode();

  return passcode !== null && safeEqual(candidate, passcode);
}

export function isHostAuthed() {
  const passcode = getHostPasscode();

  if (!passcode) return false;

  const cookie = cookies().get(HOST_COOKIE)?.value;

  if (!cookie) return false;

  return safeEqual(cookie, hostCookieValue(passcode));
}
