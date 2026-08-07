#!/usr/bin/env node
// import-cocktails.mjs — publish cocktail documents to Sanity from a JSON file.
//
// Unlike import-post.mjs, this PUBLISHES directly (no draft step): the bar-menu
// workflow's sign-off happens in chat before this script ever runs, and menu
// tweaks need to be live before guests arrive. Re-running with the same names
// overwrites in place, so it also handles edits and availability flips.
//
// Usage:
//   node scripts/import-cocktails.mjs --file menu.json
// Options:
//   --dry-run   print the documents that would be written, write nothing
//
// JSON shape: an array of
//   {
//     "name": "Negroni",
//     "description": "One line, menu-style",
//     "ingredients": ["gin", "Campari", "sweet vermouth"],
//     "category": "gin" | "whiskey" | "mezcal" | "rum" | "aperitivo" | "zero-proof",
//     "available": true            // optional, defaults to true
//   }

import { createClient } from "@sanity/client";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const CATEGORIES = ["gin", "whiskey", "mezcal", "rum", "aperitivo", "zero-proof"];

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--")) {
    return process.argv[i + 1];
  }
  return fallback;
}
const has = (name) => process.argv.includes(`--${name}`);
const die = (msg) => {
  console.error(`import-cocktails: ${msg}`);
  process.exit(1);
};

function loadEnv(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let [, k, v] = m;
    v = v.replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}

const slugify = (name) =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

async function preflight(projectId, token, envLabel) {
  if (!projectId) die(`NEXT_PUBLIC_SANITY_PROJECT_ID not found in ${envLabel}`);
  if (!token) {
    die(
      `no write token. Add SANITY_API_WRITE_TOKEN (Editor scope, from sanity.io/manage → API → Tokens) to ${envLabel}.`,
    );
  }
  let res;
  try {
    res = await fetch(`https://${projectId}.api.sanity.io/v2021-06-07/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (e) {
    die(`could not reach Sanity to validate the token (${e.message}).`);
  }
  if (res.status === 401) {
    die(
      `token rejected (401). Create an Editor-scoped token at sanity.io/manage → API → Tokens ` +
        `and set SANITY_API_WRITE_TOKEN in ${envLabel}.`,
    );
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    die(`Sanity returned ${res.status} validating the token. ${body.slice(0, 200)}`);
  }
  const me = await res.json().catch(() => ({}));
  const roles = (me.roles || []).map((r) => r.name);
  if (!roles.some((r) => ["administrator", "editor", "developer", "deploy-studio"].includes(r))) {
    die(`token is read-only (roles: ${roles.join(",") || "none"}).`);
  }
}

function validate(entry, i) {
  const at = `entry ${i + 1}${entry?.name ? ` ("${entry.name}")` : ""}`;
  if (typeof entry?.name !== "string" || !entry.name.trim()) die(`${at}: missing name`);
  if (typeof entry.description !== "string" || !entry.description.trim())
    die(`${at}: missing description`);
  if (!Array.isArray(entry.ingredients) || entry.ingredients.length === 0)
    die(`${at}: ingredients must be a non-empty array of strings`);
  if (entry.ingredients.some((x) => typeof x !== "string" || !x.trim()))
    die(`${at}: every ingredient must be a non-empty string`);
  if (!CATEGORIES.includes(entry.category))
    die(`${at}: category "${entry.category}" is not one of ${CATEGORIES.join(", ")}`);
  if (entry.available !== undefined && typeof entry.available !== "boolean")
    die(`${at}: available must be a boolean when present`);
}

async function main() {
  const file = arg("file");
  if (!file) die("--file is required");
  const path = resolve(file);
  if (!existsSync(path)) die(`no such file: ${path}`);

  let entries;
  try {
    entries = JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    die(`could not parse ${path} as JSON (${e.message})`);
  }
  if (!Array.isArray(entries) || entries.length === 0)
    die("the file must contain a non-empty JSON array");

  entries.forEach(validate);

  const docs = entries.map((entry) => ({
    _id: `cocktail-${slugify(entry.name)}`,
    _type: "cocktail",
    name: entry.name.trim(),
    description: entry.description.trim(),
    ingredients: entry.ingredients.map((x) => x.trim()),
    category: entry.category,
    available: entry.available ?? true,
  }));

  const ids = new Set();
  for (const doc of docs) {
    if (ids.has(doc._id)) die(`duplicate cocktail name after slugify: ${doc._id}`);
    ids.add(doc._id);
  }

  if (has("dry-run")) {
    console.log(JSON.stringify(docs, null, 2));
    console.error(`\nimport-cocktails: dry run. ${docs.length} cocktails. Nothing written.`);
    return;
  }

  const envPath = resolve(REPO, ".env");
  const envLocalPath = resolve(REPO, ".env.local");
  loadEnv(envPath);
  loadEnv(envLocalPath);

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const token =
    process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_WRITE_TOKEN || "";

  await preflight(projectId, token, `${envPath} (or ${envLocalPath})`);
  const client = createClient({ projectId, dataset, apiVersion: "2024-09-05", token, useCdn: false });

  let tx = client.transaction();
  for (const doc of docs) tx = tx.createOrReplace(doc);
  await tx.commit();

  const off = docs.filter((d) => !d.available).length;
  console.log(
    `import-cocktails: published ${docs.length} cocktails` +
      (off ? ` (${off} marked unavailable)` : "") +
      `. Live at /bar.`,
  );
}

main().catch((e) => die(e.message));
