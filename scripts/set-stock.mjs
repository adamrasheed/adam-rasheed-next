#!/usr/bin/env node
// set-stock.mjs: flip bottles in and out of stock, which is what moves drinks
// on and off /bar now that the menu is derived from the shelf.
//
// Usage:
//   node scripts/set-stock.mjs --list
//   node scripts/set-stock.mjs --out "Campari" --in "Rye whiskey"
//   node scripts/set-stock.mjs --out "Campari" --write
// Options:
//   --in <name>    mark in stock, repeatable. Creates the ingredient if new.
//   --out <name>   mark out of stock, repeatable
//   --write        apply. Without it this prints the plan and writes nothing.
//
// Names are matched the way the migration matches them, so "bourbon" finds
// "Woodford Reserve bourbon" and "limes" finds "Limes". The plan always shows
// which drinks the change adds to or takes off the menu, because that is the
// part worth checking before it goes live.

import {
  argAll,
  die,
  has,
  loadEnv,
  preflight,
  readClient,
  writeClient,
} from "./lib/sanity.mjs";
import {
  buildIndex,
  isCocktailAvailable,
  resolveIngredient,
} from "./lib/ingredients.mjs";

const SCRIPT = "set-stock";
const stop = (msg) => die(SCRIPT, msg);

const INGREDIENTS_QUERY = `*[_type == "ingredient"] | order(name asc){
  _id, name, category, inStock
}`;
const COCKTAILS_QUERY = `*[_type == "cocktail"] | order(name asc){
  _id, name, available, ingredients
}`;

async function main() {
  const goingIn = argAll("in");
  const goingOut = argAll("out");

  if (!has("list") && goingIn.length === 0 && goingOut.length === 0) {
    stop("nothing to do. Pass --in <name>, --out <name>, or --list.");
  }

  const env = loadEnv();

  if (!env.projectId) stop(`NEXT_PUBLIC_SANITY_PROJECT_ID not found in ${env.label}`);

  const reader = readClient(env);
  const [shelf, cocktails] = await Promise.all([
    reader.fetch(INGREDIENTS_QUERY),
    reader.fetch(COCKTAILS_QUERY),
  ]);

  if (shelf.length === 0) {
    stop("there are no ingredient documents yet. Run scripts/migrate-ingredients.mjs first.");
  }

  if (has("list")) {
    listShelf(shelf);
    if (goingIn.length === 0 && goingOut.length === 0) return;
  }

  // Sanity is the shelf now, so the match index is built from the documents
  // rather than from bar-inventory.md.
  const index = buildIndex(shelf.map(({ name, category }) => ({ name, category })));
  const byId = new Map(shelf.map((doc) => [doc._id, doc]));

  const before = new Map(shelf.map((doc) => [doc._id, doc.inStock !== false]));
  const after = new Map(before);
  const changes = [];

  for (const [names, inStock] of [
    [goingIn, true],
    [goingOut, false],
  ]) {
    for (const raw of names) {
      const resolved = resolveIngredient(raw, index);
      const existing = byId.get(resolved.id);

      if (!existing && !inStock) {
        // Marking something out that was never on the shelf is almost always a
        // typo, and creating an out-of-stock document to satisfy it would hide
        // the typo instead of surfacing it.
        stop(
          `"${raw}" is not on the shelf, so it cannot go out. Run --list to see the names.`,
        );
      }

      const id = existing ? existing._id : resolved.id;
      const was = before.get(id);

      after.set(id, inStock);
      changes.push({
        id,
        name: existing ? existing.name : resolved.name,
        written: raw,
        category: existing ? existing.category : resolved.category,
        create: !existing,
        was,
        now: inStock,
      });
    }
  }

  const menuBefore = cocktails.filter((c) => isCocktailAvailable(c, before)).map((c) => c.name);
  const menuAfter = cocktails.filter((c) => isCocktailAvailable(c, after)).map((c) => c.name);

  report(changes, menuBefore, menuAfter);

  if (!has("write")) {
    console.error(`\n${SCRIPT}: plan only. Nothing written. Re-run with --write to apply.`);
    return;
  }

  await preflight(SCRIPT, env);

  const client = writeClient(env);
  let tx = client.transaction();

  for (const change of changes) {
    if (change.create) {
      tx = tx.createIfNotExists({
        _id: change.id,
        _type: "ingredient",
        name: change.name,
        category: change.category,
        inStock: change.now,
      });
      continue;
    }

    tx = tx.patch(client.patch(change.id).set({ inStock: change.now }));
  }

  await tx.commit();

  console.log(`${SCRIPT}: updated ${changes.length} ingredients. Live at /bar within a minute.`);
}

function listShelf(shelf) {
  const out = shelf.filter((doc) => doc.inStock === false);

  console.log(`Shelf (${shelf.length} ingredients, ${out.length} out of stock)\n`);

  for (const doc of shelf) {
    console.log(`  ${doc.inStock === false ? "out" : "in "}  ${doc.name}`);
  }

  console.log("");
}

function report(changes, menuBefore, menuAfter) {
  console.log("Stock");

  for (const change of changes) {
    const from = change.create ? "new" : change.was ? "in" : "out";

    console.log(
      `  ${change.name.padEnd(28)} ${from} -> ${change.now ? "in" : "out"}` +
        (change.written === change.name ? "" : `   (matched "${change.written}")`),
    );
  }

  const added = menuAfter.filter((name) => !menuBefore.includes(name));
  const dropped = menuBefore.filter((name) => !menuAfter.includes(name));

  console.log(`\nMenu: ${menuBefore.length} drinks -> ${menuAfter.length}`);

  if (added.length) console.log(`  on:  ${added.join(", ")}`);
  if (dropped.length) console.log(`  off: ${dropped.join(", ")}`);
  if (!added.length && !dropped.length) console.log("  no change");
}

main().catch((e) => stop(e.message));
