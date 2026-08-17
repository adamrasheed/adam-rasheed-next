import { defineType } from "sanity";
import { ORDER_STATUSES } from "../barOrderStatuses";

export const orderType = defineType({
  name: "order",
  title: "Order",
  type: "document",
  description:
    "A drink a guest asked for on /bar. Deleted once it's made, so the list of orders is the queue.",
  fields: [
    {
      name: "cocktail",
      title: "Cocktail",
      type: "reference",
      to: [{ type: "cocktail" }],
      validation: (Rule) => Rule.required(),
    },
    {
      name: "guestName",
      title: "Guest",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "guestId",
      title: "Guest ID",
      type: "string",
      description:
        "Random per-browser id. The document id is derived from it, which is what limits a guest to one open order, and it authorizes their cancel.",
      validation: (Rule) => Rule.required(),
      readOnly: true,
    },
    {
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [...ORDER_STATUSES],
        layout: "radio",
      },
      initialValue: "queued",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "placedAt",
      title: "Placed at",
      type: "datetime",
      validation: (Rule) => Rule.required(),
      readOnly: true,
    },
  ],
  orderings: [
    {
      title: "Placed (oldest first)",
      name: "placedAtAsc",
      by: [{ field: "placedAt", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      guestName: "guestName",
      cocktailName: "cocktail.name",
      status: "status",
    },
    prepare({ guestName, cocktailName, status }) {
      return {
        title: `${cocktailName ?? "Unknown drink"} for ${guestName}`,
        subtitle: status,
      };
    },
  },
});
