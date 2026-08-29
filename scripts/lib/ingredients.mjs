// Turning written ingredient strings into ingredient documents.
//
// Cocktails are written the way a menu is written ("lemon twist", "sugar",
// "white rum"), while the shelf is written the way a shelf is ("Lemons",
// "Simple syrup / sugar", "White/light rum"). Both have to land on one document
// per bottle, or stock tracking splits and nothing is ever accurate. This module
// is the one place that mapping lives, so the migration, the menu import, and
// the stock flip all resolve a string the same way.

import { readFileSync } from "node:fs";

// bar-inventory.md heading -> category value. The values mirror
// src/sanity/ingredientCategories.ts, which .mjs cannot import; keep the two in
// sync by hand. guessCategory below returns from the same set.
const HEADING_CATEGORIES = {
  spirits: "spirit",
  "liqueurs and amari": "liqueur",
  "vermouth and wine": "vermouth-wine",
  bitters: "bitters",
  mixers: "mixer",
  sweeteners: "sweetener",
  "fresh and garnish": "fresh",
};

// Sections of bar-inventory.md that are notes, not shelf contents.
const NON_INVENTORY_HEADINGS = /^notably missing|^shopping|^to buy/i;

export const slugify = (name) =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const ingredientId = (name) => `ingredient-${slugify(name)}`;

/**
 * Matching key for an ingredient string. Case, accents, punctuation, and plurals
 * are all noise here: "Limes" on the shelf and "lime" in a recipe are the same
 * jar. Applied to both sides, so the singularising is symmetric and a word it
 * mangles ("bitters" -> "bitter") still matches itself.
 */
export function normalizeName(raw) {
  const singular = (word) => {
    if (word.length <= 3) return word;
    if (word.endsWith("ies")) return `${word.slice(0, -3)}y`;
    if (word.endsWith("ss")) return word;
    if (word.endsWith("s")) return word.slice(0, -1);
    return word;
  };

  return String(raw)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\(.*?\)/g, " ") // "Mezcal (2 bottles)" is still mezcal
    .replace(/[^a-z0-9/\s-]/g, " ") // drops the dots in "D.O.M."
    .replace(/[/-]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map(singular)
    .join(" ");
}

/**
 * Written strings that do not normalize onto a shelf entry, mapped by hand.
 * Keys are written naturally and normalized on load. The right-hand side must
 * name a shelf entry (an inventory line, or another alias target) exactly.
 */
const ALIAS_SOURCE = {
  // Generic call in a recipe, one specific bottle on the shelf.
  gin: "Amass gin",
  bourbon: "Woodford Reserve bourbon",
  "rye whiskey": "Rye whiskey",
  "white rum": "White/light rum",
  "light rum": "White/light rum",
  "dark rum": "Aged/dark rum",
  "aged rum": "Aged/dark rum",
  benedictine: "Benedictine D.O.M.",

  // One jar, several ways of asking for it.
  "simple syrup": "Simple syrup / sugar",
  sugar: "Simple syrup / sugar",
  "sugar cube": "Simple syrup / sugar",
  "lemon juice": "Lemons",
  "lemon twist": "Lemons",
  "lemon peel": "Lemons",
  "lime juice": "Limes",
  "lime wedge": "Limes",
  "orange twist": "Oranges",
  "orange slice": "Oranges",
  "orange peel": "Oranges",
  "luxardo cherry syrup": "Luxardo cherries",
  olives: "Castelvetrano olives",

  // The Crisp Martini's float. The shelf line is "Wine (a few bottles, type
  // unspecified)", so this is the bottle it draws from until wine is split out.
  "sauvignon blanc": "Wine",
  "sauvignon blanc float": "Wine",

  // Written as a choice of garnish. Resolves to the one it gates on; the drink
  // keeps the full wording as its menu label.
  "castelvetrano olives or lemon twist": "Castelvetrano olives",
};

const ALIASES = new Map(
  Object.entries(ALIAS_SOURCE).map(([from, to]) => [normalizeName(from), to]),
);

/**
 * Strings that are only ever a garnish on this menu, so the drink still gets
 * made without them. Exact normalized strings, plus the patterns
 * below, and deliberately not a property of the ingredient: "Luxardo cherry" is
 * a garnish on a Manhattan while "Luxardo cherry syrup" carries the Rickey.
 */
const OPTIONAL_STRINGS = new Set(
  [
    "orange",
    "lemon twist",
    "luxardo cherry",
    "castelvetrano olives",
    "castelvetrano olives or lemon twist",
  ].map(normalizeName),
);

// Deliberately no "float": a float is a component of the drink, not a garnish.
// The Crisp Martini without its Sauvignon Blanc is a different cocktail.
const OPTIONAL_PATTERNS = /\b(twist|peel|wedge|slice|garnish)\b/;

/** Is this written ingredient a garnish rather than something the drink needs? */
export function isOptionalString(raw) {
  const key = normalizeName(raw);

  return OPTIONAL_STRINGS.has(key) || OPTIONAL_PATTERNS.test(key);
}

function guessCategory(name) {
  const key = normalizeName(name);
  const test = (words) => words.some((w) => key.includes(w));

  if (test(["bitter"])) return "bitters";
  if (test(["vermouth", "wine", "sherry", "prosecco", "champagne"])) return "vermouth-wine";
  if (test(["syrup", "sugar", "honey", "agave"])) return "sweetener";
  if (test(["soda", "tonic", "ginger beer", "cola", "juice"])) return "mixer";
  if (test(["lime", "lemon", "orange", "cherry", "olive", "mint", "spice"])) return "fresh";
  if (test(["gin", "rum", "whiskey", "whisky", "bourbon", "rye", "scotch", "mezcal", "tequila", "vodka", "brandy", "cognac"]))
    return "spirit";

  return "liqueur";
}

/**
 * Shelf entries from bar-inventory.md. Only the stocked sections: the "Notably
 * missing" list is a shopping list, and seeding it would create documents for
 * bottles that are not on the shelf.
 */
export function parseInventory(path) {
  const entries = [];
  let category = null;
  let skipping = false;

  for (const line of readFileSync(path, "utf8").split("\n")) {
    const heading = line.match(/^##\s+(.*)$/);

    if (heading) {
      const title = heading[1].trim();
      skipping = NON_INVENTORY_HEADINGS.test(title);
      category = HEADING_CATEGORIES[title.toLowerCase()] ?? null;
      continue;
    }

    const bullet = line.match(/^[-*]\s+(.*)$/);

    if (!bullet || skipping) continue;

    // "Mezcal (2 bottles)" is a count, not a different bottle. A trailing
    // period is left alone: it belongs to "Benedictine D.O.M.".
    const name = bullet[1].replace(/\(.*?\)/g, "").trim().replace(/,$/, "");

    if (!name) continue;

    entries.push({ name, category: category ?? guessCategory(name) });
  }

  return entries;
}

/**
 * Index of every known shelf name, keyed by normalized name and by alias, so a
 * written string can be looked up in one step.
 */
export function buildIndex(entries) {
  const byKey = new Map();
  const byName = new Map();

  for (const entry of entries) {
    byKey.set(normalizeName(entry.name), entry);
    byName.set(entry.name, entry);
  }

  for (const [key, target] of ALIASES) {
    const entry = byName.get(target);

    // An alias pointing at a bottle that is not on the shelf is not an error:
    // "rye whiskey" is on the missing list, and the alias starts working the
    // day the bottle is added.
    if (entry && !byKey.has(key)) byKey.set(key, entry);
  }

  return byKey;
}

/**
 * Resolve one written ingredient string to the document it belongs to.
 *
 * `matched: false` means nothing on the shelf answers to it. Callers report
 * those rather than dropping them: an unmatched string is either a typo or a
 * bottle the inventory never listed, and both need a human.
 */
export function resolveIngredient(raw, index) {
  const written = String(raw).trim();
  const key = normalizeName(written);
  const entry = index.get(key);
  const shelfName = entry ? entry.name : written;

  return {
    written,
    matched: Boolean(entry),
    name: shelfName,
    category: entry ? entry.category : guessCategory(written),
    id: ingredientId(shelfName),
    // The menu keeps the drink's own wording. Only when it matches the shelf
    // name exactly is the label redundant.
    label: written === shelfName ? null : written,
    optional: isOptionalString(written),
  };
}

/** The array item the cocktail schema expects. */
export function ingredientRow(resolved, key) {
  return {
    _key: key,
    _type: "cocktailIngredient",
    ingredient: { _type: "reference", _ref: resolved.id },
    ...(resolved.label ? { label: resolved.label } : {}),
    ...(resolved.optional ? { optional: true } : {}),
  };
}

/**
 * The menu rule, in JavaScript, for scripts that need to show what a stock
 * change will do to the menu. Mirrors COCKTAIL_IN_STOCK in src/sanity/queries.ts,
 * which is what actually decides the live page. Keep them in step.
 */
export function isCocktailAvailable(cocktail, inStockById) {
  if (cocktail.available === false) return false;

  const rows = cocktail.ingredients;

  if (!Array.isArray(rows) || rows.length === 0) return false;

  return rows.every(
    (row) =>
      row?.optional === true || inStockById.get(row?.ingredient?._ref) === true,
  );
}
