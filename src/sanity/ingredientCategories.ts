// Shelf groupings, mirroring the sections bar-inventory.md used when it was the
// hand-maintained source of truth. Lives outside schemaTypes/ for the same
// reason cocktailCategories.ts does: page code must never import the Studio
// `sanity` package. scripts/lib/ingredients.mjs keeps its own copy of the
// values, because .mjs cannot import a .ts module.
export const INGREDIENT_CATEGORIES = [
  { title: "Spirits", value: "spirit" },
  { title: "Liqueurs & Amari", value: "liqueur" },
  { title: "Vermouth & Wine", value: "vermouth-wine" },
  { title: "Bitters", value: "bitters" },
  { title: "Mixers", value: "mixer" },
  { title: "Sweeteners", value: "sweetener" },
  { title: "Fresh & Garnish", value: "fresh" },
] as const;
