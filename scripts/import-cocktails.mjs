#!/usr/bin/env node
// import-cocktails.mjs: publish cocktail documents to Sanity from a JSON file.
//
// Unlike import-post.mjs, this PUBLISHES directly (no draft step): the bar-menu
// workflow's sign-off happens in chat before this script ever runs, and menu
// tweaks need to be live before guests arrive. Re-running with the same names
// overwrites in place, so it also handles edits and availability flips.
//
// Ingredients are still written as plain strings here, because that is how a
// menu gets written. The script resolves each string to the `ingredient`
// document that tracks its stock, which is what decides whether the drink shows
// on /bar at all. A string it cannot resolve stops the import rather than
// quietly publishing a drink that references nothing.
//
// Usage:
//   node scripts/import-cocktails.mjs --file menu.json
// Options:
//   --dry-run          print the documents that would be written, write nothing
//   --create-missing   create ingredients the shelf has never heard of, marked
//                      out of stock (so the drink stays off the menu until the
//                      bottle is checked in with set-stock.mjs)
//
// JSON shape: an array of
//   {
//     "name": "Negroni",
//     "description": "One line, menu-style",
//     "ingredients": ["Amass gin", "Campari", "sweet vermouth", "orange"],
//     "category": "gin" | "whiskey" | "mezcal" | "rum" | "aperitivo" | "zero-proof",
//     "available": true            // optional, defaults to true. An explicit 86.
//   }

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

import {
  arg,
  die,
  has,
  loadEnv,
  preflight,
  readClient,
  writeClient,
} from "./lib/sanity.mjs";
import {
  buildIndex,
  ingredientRow,
  resolveIngredient,
  slugify,
} from "./lib/ingredients.mjs";

const SCRIPT = "import-cocktails";
const stop = (msg) => die(SCRIPT, msg);

const CATEGORIES = ["gin", "whiskey", "mezcal", "rum", "aperitivo", "zero-proof"];

const INGREDIENTS_QUERY = `*[_type == "ingredient"]{ _id, name, category, inStock }`;

function validate(entry, i) {
  const at = `entry ${i + 1}${entry?.name ? ` ("${entry.name}")` : ""}`;

  if (typeof entry?.name !== "string" || !entry.name.trim()) stop(`${at}: missing name`);
  if (typeof entry.description !== "string" || !entry.description.trim())
    stop(`${at}: missing description`);
  if (!Array.isArray(entry.ingredients) || entry.ingredients.length === 0)
    stop(`${at}: ingredients must be a non-empty array of strings`);
  if (entry.ingredients.some((x) => typeof x !== "string" || !x.trim()))
    stop(`${at}: every ingredient must be a non-empty string`);
  if (!CATEGORIES.includes(entry.category))
    stop(`${at}: category "${entry.category}" is not one of ${CATEGORIES.join(", ")}`);
  if (entry.available !== undefined && typeof entry.available !== "boolean")
    stop(`${at}: available must be a boolean when present`);
}

async function main() {
  const file = arg("file");

  if (!file) stop("--file is required");

  const path = resolve(file);

  if (!existsSync(path)) stop(`no such file: ${path}`);

  let entries;

  try {
    entries = JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    stop(`could not parse ${path} as JSON (${e.message})`);
  }

  if (!Array.isArray(entries) || entries.length === 0)
    stop("the file must contain a non-empty JSON array");

  entries.forEach(validate);

  const env = loadEnv();

  if (!env.projectId) stop(`NEXT_PUBLIC_SANITY_PROJECT_ID not found in ${env.label}`);

  // The shelf is read even on a dry run: resolving ingredients is most of what
  // can go wrong with an import now, so the dry run has to check it.
  const shelf = await readClient(env).fetch(INGREDIENTS_QUERY);

  if (shelf.length === 0) {
    stop("there are no ingredient documents yet. Run scripts/migrate-ingredients.mjs first.");
  }

  const index = buildIndex(shelf.map(({ name, category }) => ({ name, category })));
  const onShelf = new Set(shelf.map((doc) => doc._id));
  const missing = [];
  const newIngredients = new Map();

  const docs = entries.map((entry) => {
    const rows = entry.ingredients.map((written, i) => {
      const resolved = resolveIngredient(written, index);

      if (!onShelf.has(resolved.id)) {
        missing.push({ cocktail: entry.name, written, id: resolved.id });
        newIngredients.set(resolved.id, {
          _id: resolved.id,
          _type: "ingredient",
          name: resolved.name,
          category: resolved.category,
          // Out of stock, because nothing says it is on the shelf. The drink
          // publishes but stays off the menu until the bottle is checked in.
          inStock: false,
        });
      }

      return ingredientRow(resolved, `${slugify(written) || "row"}-${i}`);
    });

    return {
      _id: `cocktail-${slugify(entry.name)}`,
      _type: "cocktail",
      name: entry.name.trim(),
      description: entry.description.trim(),
      ingredients: rows,
      category: entry.category,
      available: entry.available ?? true,
    };
  });

  const ids = new Set();

  for (const doc of docs) {
    if (ids.has(doc._id)) stop(`duplicate cocktail name after slugify: ${doc._id}`);
    ids.add(doc._id);
  }

  if (missing.length && !has("create-missing")) {
    for (const miss of missing) {
      console.error(`  "${miss.written}" (${miss.cocktail}) -> ${miss.id}, not on the shelf`);
    }

    stop(
      `${missing.length} ingredient(s) have no document. Check the bottle in with ` +
        `scripts/set-stock.mjs --in "<name>", add an alias in scripts/lib/ingredients.mjs, ` +
        `or re-run with --create-missing to create them out of stock.`,
    );
  }

  if (has("dry-run")) {
    console.log(JSON.stringify([...newIngredients.values(), ...docs], null, 2));
    console.error(
      `\n${SCRIPT}: dry run. ${docs.length} cocktails` +
        (newIngredients.size ? `, ${newIngredients.size} new ingredients` : "") +
        ". Nothing written.",
    );
    return;
  }

  await preflight(SCRIPT, env);

  const client = writeClient(env);
  let tx = client.transaction();

  // Ingredients first, and createIfNotExists so an import never resets stock.
  for (const doc of newIngredients.values()) tx = tx.createIfNotExists(doc);
  for (const doc of docs) tx = tx.createOrReplace(doc);

  await tx.commit();

  const off = docs.filter((d) => !d.available).length;

  console.log(
    `${SCRIPT}: published ${docs.length} cocktails` +
      (off ? ` (${off} marked unavailable)` : "") +
      (newIngredients.size ? `, created ${newIngredients.size} out-of-stock ingredients` : "") +
      `. Live at /bar.`,
  );
}

main().catch((e) => stop(e.message));
