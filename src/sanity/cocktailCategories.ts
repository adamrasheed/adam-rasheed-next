// Shared between the cocktail schema and the /bar page. Lives outside
// schemaTypes/ so page code never imports the Studio `sanity` package.
export const COCKTAIL_CATEGORIES = [
  { title: "Gin", value: "gin" },
  { title: "Whiskey", value: "whiskey" },
  { title: "Mezcal", value: "mezcal" },
  { title: "Rum", value: "rum" },
  { title: "Aperitivo & Low-Proof", value: "aperitivo" },
  { title: "Zero-Proof", value: "zero-proof" },
] as const;
