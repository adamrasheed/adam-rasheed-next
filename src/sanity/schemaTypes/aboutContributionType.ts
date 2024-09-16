import { defineType } from "sanity";
import { DiamondIcon } from "@sanity/icons";

export const contributionType = defineType({
  name: "contribution",
  title: "Contribution",
  icon: DiamondIcon,
  type: "object", // Define as an object to be embedded within "about"
  fields: [
    {
      name: "title",
      title: "Contribution Type",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "contributions",
      title: "ContributionsItems",
      type: "array",
      of: [
        {
          type: "object",
          name: "contribution",
          fields: [
            {
              name: "title",
              title: "Title",
              type: "string",
              validation: (Rule) => Rule.required(),
            },
            { name: "link", title: "Link", type: "url" },
            { name: "description", title: "Description", type: "text" },
            { name: "date", title: "Date", type: "date" },
          ],
        },
      ],
    },
  ],
});
