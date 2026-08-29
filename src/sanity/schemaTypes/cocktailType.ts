import { defineType } from "sanity";
import { COCKTAIL_CATEGORIES } from "../cocktailCategories";

export const cocktailType = defineType({
  name: "cocktail",
  title: "Cocktail",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "description",
      title: "Description",
      type: "string",
      description: "One line, menu-style",
      validation: (Rule) => Rule.required(),
    },
    {
      // Ingredients are references, not strings, because the menu is derived
      // from stock: an unchecked ingredient has to take every drink that needs
      // it off /bar without anyone editing the cocktails.
      //
      // Each row is an object rather than a bare reference for two reasons that
      // both have to live per drink, not per bottle:
      //   - `label` keeps the wording Adam wrote for this drink ("lemon twist")
      //     while still pointing at the one Lemons document that tracks stock.
      //   - `optional` is what stops a garnish from 86ing a whole cocktail. It
      //     is per drink because the same bottle is a garnish in one recipe and
      //     the base of another (Luxardo cherries garnish a Manhattan and carry
      //     the Cherry Lime Rickey).
      name: "ingredients",
      title: "Ingredients",
      type: "array",
      of: [
        {
          type: "object",
          name: "cocktailIngredient",
          title: "Ingredient",
          fields: [
            {
              name: "ingredient",
              title: "Ingredient",
              type: "reference",
              to: [{ type: "ingredient" }],
              validation: (Rule) => Rule.required(),
            },
            {
              name: "label",
              title: "Menu wording",
              type: "string",
              description:
                "Optional. How this reads on the menu when the drink says it differently than the shelf does (\"lemon twist\" for Lemons). Blank uses the ingredient name.",
            },
            {
              name: "optional",
              title: "Optional",
              type: "boolean",
              description:
                "Garnishes and floats. Running out of this does not take the drink off the menu.",
              initialValue: false,
            },
          ],
          preview: {
            select: {
              label: "label",
              name: "ingredient.name",
              optional: "optional",
            },
            prepare({ label, name, optional }) {
              return {
                title: label || name || "Missing ingredient",
                subtitle: optional ? "optional" : undefined,
              };
            },
          },
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    },
    {
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [...COCKTAIL_CATEGORIES],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    },
    {
      // Kept as an explicit override on top of the derived availability. Stock
      // decides whether a drink can be made; this decides whether it is offered
      // even when it can be. Off always wins, so it stays the way to pull a
      // drink you have every bottle for.
      name: "available",
      title: "Available",
      type: "boolean",
      description:
        "Off the menu when unchecked (86'd), whatever the shelf says. On still needs every ingredient in stock.",
      initialValue: true,
    },
  ],
  preview: {
    select: { title: "name", subtitle: "category", available: "available" },
    prepare({ title, subtitle, available }) {
      return {
        title: available === false ? `${title} (86'd)` : title,
        subtitle,
      };
    },
  },
});
