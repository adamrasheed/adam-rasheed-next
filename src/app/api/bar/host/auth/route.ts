import { NextResponse } from "next/server";

import {
  HOST_COOKIE,
  HOST_COOKIE_MAX_AGE,
  getHostPasscode,
  hostCookieValue,
  isPasscodeCorrect,
} from "@/sanity/lib/hostAuth";

import { NO_STORE, fail, readJsonObject, trimmedString } from "../../_lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Sign in to the host console. */
export async function POST(request: Request) {
  const passcode = getHostPasscode();

  if (!passcode) {
    console.error("BAR_HOST_PASSCODE is not set, so the host console is locked");

    return fail("The host console isn't set up yet.", 500);
  }

  const body = await readJsonObject(request);

  if (!body) return fail("Malformed request.", 400);

  const candidate = trimmedString(body.passcode);

  if (!candidate || !isPasscodeCorrect(candidate)) {
    return fail("Wrong passcode.", 401);
  }

  const response = NextResponse.json({ authed: true }, { headers: NO_STORE });

  response.cookies.set({
    name: HOST_COOKIE,
    value: hostCookieValue(passcode),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: HOST_COOKIE_MAX_AGE,
  });

  return response;
}

/** Sign out. */
export async function DELETE() {
  const response = NextResponse.json({ authed: false }, { headers: NO_STORE });

  response.cookies.set({
    name: HOST_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
