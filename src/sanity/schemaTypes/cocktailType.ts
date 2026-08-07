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
      name: "ingredients",
      title: "Ingredients",
      type: "array",
      of: [{ type: "string" }],
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
      name: "available",
      title: "Available",
      type: "boolean",
      description: "Off the menu when unchecked (86'd)",
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
