import "server-only";

import { barReadClient } from "./barClient";
import { HOST_SHELF_QUERY } from "../queries";
import { INGREDIENT_CATEGORIES } from "../ingredientCategories";
import type { HOST_SHELF_QUERYResult } from "../../../sanity.types";

export type ShelfItem = {
  _id: string;
  name: string;
  inStock: boolean;
  /**
   * Cocktails that need this and cannot be made without it. Not "cocktails
   * that mention it": a garnish is excluded, because turning a garnish off
   * changes nothing on the menu and listing it would make every warning noise.
   */
  requiredBy: string[];
  /**
   * Of those, the ones that would actually leave the menu if this went out —
   * which is fewer than requiredBy whenever a drink is already off for some
   * other missing bottle. This is the number worth showing.
   */
  wouldRemove: string[];
  /**
   * Drinks that use it as a garnish or float. Kept separate from requiredBy so
   * the console can say "garnish only" instead of "nothing uses this": oranges
   * garnish seven drinks while requiring none, and calling that unused would
   * read as dead stock.
   */
  garnishFor: string[];
};

export type ShelfSection = {
  value: string;
  title: string;
  items: ShelfItem[];
};

export type HostShelf = {
  sections: ShelfSection[];
  onMenu: number;
  totalCocktails: number;
};

const OTHER = { value: "other", title: "Other" } as const;

function toShelf(result: HOST_SHELF_QUERYResult): HostShelf {
  const stockById = new Map(
    result.ingredients.map((item) => [item._id, item.inStock === true])
  );

  // A cocktail is makeable when every required bottle is in stock. Mirrors
  // COCKTAIL_IN_STOCK in queries.ts; the query there already drops `available:
  // false` drinks, so this only has to answer the stock half.
  const missingFor = (requires: Array<string | null> | null) =>
    (requires ?? []).filter(
      (ref): ref is string => typeof ref === "string" && !stockById.get(ref)
    );

  const cocktails = result.cocktails.map((cocktail) => ({
    name: cocktail.name ?? "Untitled",
    requires: (cocktail.requires ?? []).filter(
      (ref): ref is string => typeof ref === "string"
    ),
    garnishes: (cocktail.garnishes ?? []).filter(
      (ref): ref is string => typeof ref === "string"
    ),
    missing: missingFor(cocktail.requires),
  }));

  const items: ShelfItem[] = result.ingredients.map((ingredient) => {
    const requiredBy = cocktails.filter((c) =>
      c.requires.includes(ingredient._id)
    );

    return {
      _id: ingredient._id,
      name: ingredient.name ?? "Unnamed",
      inStock: ingredient.inStock === true,
      requiredBy: requiredBy.map((c) => c.name),
      garnishFor: cocktails
        .filter((c) => c.garnishes.includes(ingredient._id))
        .map((c) => c.name),
      // Already off the menu for another reason, so this toggle is not what
      // takes it away and should not be counted against this bottle.
      wouldRemove: requiredBy
        .filter(
          (c) =>
            c.missing.length === 0 ||
            (c.missing.length === 1 && c.missing[0] === ingredient._id)
        )
        .map((c) => c.name),
    };
  });

  const byCategory = new Map<string, ShelfItem[]>();

  result.ingredients.forEach((ingredient, index) => {
    const key = ingredient.category ?? OTHER.value;
    const bucket = byCategory.get(key) ?? [];

    bucket.push(items[index]);
    byCategory.set(key, bucket);
  });

  const known = INGREDIENT_CATEGORIES.map((category) => ({
    value: category.value as string,
    title: category.title as string,
    items: byCategory.get(category.value) ?? [],
  }));

  // Anything whose category the schema does not know about still has to be
  // reachable, or a bottle becomes untoggleable because of a bad enum value.
  const leftovers = [...byCategory.keys()].filter(
    (key) => !INGREDIENT_CATEGORIES.some((c) => c.value === key)
  );

  const sections = [
    ...known,
    ...leftovers.map((key) => ({
      value: key,
      title: key === OTHER.value ? OTHER.title : key,
      items: byCategory.get(key) ?? [],
    })),
  ].filter((section) => section.items.length > 0);

  return {
    sections,
    onMenu: cocktails.filter((c) => c.missing.length === 0).length,
    totalCocktails: cocktails.length,
  };
}

export async function getHostShelf(): Promise<HostShelf> {
  return toShelf(await barReadClient.fetch(HOST_SHELF_QUERY));
}
