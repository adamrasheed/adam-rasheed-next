import { defineType } from "sanity";
import { INGREDIENT_CATEGORIES } from "../ingredientCategories";

// One bottle, jar, or piece of produce on the shelf. This is the document that
// actually drives the menu: a cocktail is only shown on /bar when every
// ingredient it needs is inStock, so unchecking a box here 86s every drink that
// depends on it at once. Ids are deterministic (`ingredient-<slug of name>`) so
// the import scripts can resolve a written ingredient string to a document
// without a lookup table in Sanity.
export const ingredientType = defineType({
  name: "ingredient",
  title: "Ingredient",
  type: "document",
  description: "What's on the shelf. Uncheck In stock and the drinks that need it drop off the menu.",
  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
      description:
        "The shelf name, brand where it matters (\"Amass gin\"). Renaming does not move the document id, so keep names stable once the scripts have created them.",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "inStock",
      title: "In stock",
      type: "boolean",
      description: "Off when the bottle is empty or the fruit ran out",
      initialValue: true,
    },
    {
      name: "category",
      title: "Category",
      type: "string",
      description: "Shelf grouping only. Nothing on the menu reads this.",
      options: {
        list: [...INGREDIENT_CATEGORIES],
      },
    },
  ],
  orderings: [
    {
      title: "Name",
      name: "nameAsc",
      by: [{ field: "name", direction: "asc" }],
    },
    {
      title: "Out of stock first",
      name: "stockAsc",
      by: [
        { field: "inStock", direction: "asc" },
        { field: "name", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: { title: "name", category: "category", inStock: "inStock" },
    prepare({ title, category, inStock }) {
      const label = INGREDIENT_CATEGORIES.find((c) => c.value === category)?.title;

      return {
        // The stock state has to be readable from the list view, because that
        // list is the shelf: scanning it is how you spot what ran out.
        title: inStock === false ? `${title} (out)` : title,
        subtitle: label,
      };
    },
  },
});
