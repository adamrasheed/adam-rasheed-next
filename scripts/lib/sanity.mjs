// Shared plumbing for the bar scripts: argument parsing, .env loading, and a
// write client that refuses to hand back a token it has not proven is usable.
// Extracted from import-cocktails.mjs when set-stock.mjs and
// migrate-ingredients.mjs needed the same preflight.

import { createClient } from "@sanity/client";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

/** Value after `--name`, or `fallback` when the flag is absent. */
export function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--")) {
    return process.argv[i + 1];
  }
  return fallback;
}

/** Every value passed as `--name <value>`, for flags that repeat. */
export function argAll(name) {
  const values = [];
  process.argv.forEach((token, i) => {
    if (token !== `--${name}`) return;
    const value = process.argv[i + 1];
    if (value && !value.startsWith("--")) values.push(value);
  });
  return values;
}

export const has = (name) => process.argv.includes(`--${name}`);

export function die(script, msg) {
  console.error(`${script}: ${msg}`);
  process.exit(1);
}

function loadEnvFile(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let [, k, v] = m;
    v = v.replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}

export function loadEnv() {
  const envPath = resolve(REPO, ".env");
  const envLocalPath = resolve(REPO, ".env.local");

  loadEnvFile(envPath);
  loadEnvFile(envLocalPath);

  return {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    token:
      process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_WRITE_TOKEN || "",
    label: `${envPath} (or ${envLocalPath})`,
  };
}

/**
 * Fail before any write if the project or token is wrong, so a bad token
 * surfaces as one clear message instead of a half-applied transaction.
 */
export async function preflight(script, { projectId, token, label }) {
  const stop = (msg) => die(script, msg);

  if (!projectId) stop(`NEXT_PUBLIC_SANITY_PROJECT_ID not found in ${label}`);
  if (!token) {
    stop(
      `no write token. Add SANITY_API_WRITE_TOKEN (Editor scope, from sanity.io/manage → API → Tokens) to ${label}.`,
    );
  }

  let res;
  try {
    res = await fetch(`https://${projectId}.api.sanity.io/v2021-06-07/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (e) {
    stop(`could not reach Sanity to validate the token (${e.message}).`);
  }

  if (res.status === 401) {
    stop(
      `token rejected (401). Create an Editor-scoped token at sanity.io/manage → API → Tokens ` +
        `and set SANITY_API_WRITE_TOKEN in ${label}.`,
    );
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    stop(`Sanity returned ${res.status} validating the token. ${body.slice(0, 200)}`);
  }

  const me = await res.json().catch(() => ({}));
  const roles = (me.roles || []).map((r) => r.name);

  if (!roles.some((r) => ["administrator", "editor", "developer", "deploy-studio"].includes(r))) {
    stop(`token is read-only (roles: ${roles.join(",") || "none"}).`);
  }
}

/**
 * Client for reads. The token is passed only so a private dataset still
 * answers; nothing in a read path calls a mutating method.
 */
export function readClient({ projectId, dataset, token }) {
  return createClient({
    projectId,
    dataset,
    apiVersion: "2024-09-05",
    useCdn: false,
    ...(token ? { token } : {}),
  });
}

export function writeClient({ projectId, dataset, token }) {
  return createClient({ projectId, dataset, apiVersion: "2024-09-05", token, useCdn: false });
}
