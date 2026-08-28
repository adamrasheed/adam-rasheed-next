#!/usr/bin/env node
// migrate-ingredients.mjs: move the bar from ingredient strings to ingredient
// documents, once.
//
// Cocktails used to carry plain strings and a hand-flipped `available` boolean.
// The menu is now derived from stock, so every string has to become a reference
// to an `ingredient` document that carries `inStock`. This script creates those
// documents from the union of bar-inventory.md and the strings already written
// on the cocktails, then relinks each cocktail.
//
// Usage:
//   node scripts/migrate-ingredients.mjs            # plan only, writes nothing
//   node scripts/migrate-ingredients.mjs --write    # apply the plan
// Options:
//   --inventory <path>  inventory markdown (default: bar-inventory.md)
//   --force             re-link cocktails that already use references
//
// Dry run is the default, not a flag: this rewrites every cocktail on the menu,
// so the plan gets read before anything is written.
//
// Re-runnable. Ingredient documents are created with createIfNotExists, so a
// second run never resets a bottle Adam has since marked out of stock.

import { resolve } from "node:path";
import { existsSync } from "node:fs";

import {
  REPO,
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
  ingredientId,
  ingredientRow,
  parseInventory,
  resolveIngredient,
  slugify,
} from "./lib/ingredients.mjs";

const SCRIPT = "migrate-ingredients";
const stop = (msg) => die(SCRIPT, msg);

const COCKTAILS_QUERY = `*[_type == "cocktail"] | order(name asc){
  _id, name, available, ingredients
}`;
const INGREDIENTS_QUERY = `*[_type == "ingredient"]{ _id, name, inStock }`;

/** Old shape: an array of strings. New shape: an array of objects. */
const isStringList = (list) =>
  Array.isArray(list) && list.every((x) => typeof x === "string");

async function main() {
  const inventoryPath = resolve(arg("inventory", resolve(REPO, "bar-inventory.md")));

  if (!existsSync(inventoryPath)) stop(`no such file: ${inventoryPath}`);

  const shelf = parseInventory(inventoryPath);

  if (shelf.length === 0) stop(`found no shelf entries in ${inventoryPath}`);

  const index = buildIndex(shelf);
  const env = loadEnv();

  if (!env.projectId) stop(`NEXT_PUBLIC_SANITY_PROJECT_ID not found in ${env.label}`);

  const reader = readClient(env);

  const [cocktails, existingIngredients] = await Promise.all([
    reader.fetch(COCKTAILS_QUERY),
    reader.fetch(INGREDIENTS_QUERY),
  ]);

  const existingById = new Map(existingIngredients.map((doc) => [doc._id, doc]));

  // Every ingredient document the menu will need, shelf first so an inventory
  // entry wins the category over a guess made from a written string.
  const wanted = new Map();

  for (const entry of shelf) {
    wanted.set(ingredientId(entry.name), {
      _id: ingredientId(entry.name),
      _type: "ingredient",
      name: entry.name,
      category: entry.category,
      // Everything the inventory lists is on the shelf by definition. That file
      // was the source of truth right up until this run.
      inStock: true,
    });
  }

  const unmatched = [];
  const plans = [];

  for (const cocktail of cocktails) {
    const list = cocktail.ingredients ?? [];

    if (!isStringList(list)) {
      if (!has("force")) {
        plans.push({ cocktail, skipped: "already references ingredients" });
        continue;
      }

      stop(
        `${cocktail.name} already uses references and --force cannot rebuild it from them. ` +
          `Fix it in the Studio instead.`,
      );
    }

    const rows = list.map((written, i) => {
      const resolved = resolveIngredient(written, index);

      if (!resolved.matched) {
        unmatched.push({ cocktail: cocktail.name, written, id: resolved.id });

        // Created out of stock: nothing on the shelf answers to this string, so
        // the honest state is "not available", which also keeps the drink off
        // the menu until Adam looks at it.
        if (!wanted.has(resolved.id)) {
          wanted.set(resolved.id, {
            _id: resolved.id,
            _type: "ingredient",
            name: resolved.name,
            category: resolved.category,
            inStock: false,
          });
        }
      }

      return {
        resolved,
        row: ingredientRow(resolved, `${slugify(written) || "row"}-${i}`),
      };
    });

    plans.push({ cocktail, rows });
  }

  report({ shelf, wanted, existingById, plans, unmatched, inventoryPath });

  if (!has("write")) {
    console.error(`\n${SCRIPT}: plan only. Nothing written. Re-run with --write to apply.`);
    return;
  }

  await preflight(SCRIPT, env);

  const client = writeClient(env);
  let tx = client.transaction();

  for (const doc of wanted.values()) {
    // createIfNotExists, never createOrReplace: a re-run must not reset stock
    // that has been flipped since the first run.
    tx = tx.createIfNotExists(doc);
  }

  for (const plan of plans) {
    if (plan.skipped) continue;

    tx = tx.patch(
      client.patch(plan.cocktail._id).set({ ingredients: plan.rows.map((r) => r.row) }),
    );
  }

  await tx.commit();

  console.log(
    `${SCRIPT}: wrote ${wanted.size} ingredients and relinked ` +
      `${plans.filter((p) => !p.skipped).length} cocktails.`,
  );
}

function report({ shelf, wanted, existingById, plans, unmatched, inventoryPath }) {
  console.log(`Inventory: ${inventoryPath} (${shelf.length} shelf entries)\n`);

  console.log("Ingredients");

  for (const doc of [...wanted.values()].sort((a, b) => a.name.localeCompare(b.name))) {
    const already = existingById.get(doc._id);
    const state = already
      ? `exists, in stock ${already.inStock !== false}`
      : `create, in stock ${doc.inStock}`;

    console.log(`  ${doc.name.padEnd(28)} ${doc._id.padEnd(34)} ${state}`);
  }

  console.log("\nCocktails");

  for (const plan of plans) {
    if (plan.skipped) {
      console.log(`  ${plan.cocktail.name}: skipped (${plan.skipped})`);
      continue;
    }

    const before = (plan.cocktail.ingredients ?? []).join(" · ");
    const after = plan.rows
      .map(({ resolved }) => {
        const shown = resolved.label ?? resolved.name;

        return resolved.optional ? `${shown} (optional)` : shown;
      })
      .join(" · ");

    console.log(`  ${plan.cocktail.name}`);
    console.log(`    before  ${before}`);
    console.log(`    after   ${after}`);
  }

  // The menu line is what a guest reads. If the migration changes it, the
  // wording Adam wrote got lost somewhere in the mapping.
  const rewordings = plans.filter((plan) => {
    if (plan.skipped) return false;

    const before = (plan.cocktail.ingredients ?? []).join(" · ");
    const after = plan.rows.map(({ resolved }) => resolved.label ?? resolved.name).join(" · ");

    return before !== after;
  });

  console.log(
    `\nMenu wording: ${rewordings.length === 0 ? "unchanged on every drink" : `CHANGES on ${rewordings.map((p) => p.cocktail.name).join(", ")}`}`,
  );

  if (unmatched.length === 0) {
    console.log("Unmatched strings: none");
    return;
  }

  console.log(`\nUnmatched strings (${unmatched.length}). Nothing on the shelf answers to these,`);
  console.log("so they become out-of-stock ingredients and their drinks stay off the menu:");

  for (const miss of unmatched) {
    console.log(`  "${miss.written}" (${miss.cocktail}) -> ${miss.id}`);
  }

  console.log(
    "\nFix by adding the bottle to bar-inventory.md, or by adding an alias in\n" +
      "scripts/lib/ingredients.mjs, then re-running this plan.",
  );
}

main().catch((e) => stop(e.message));
