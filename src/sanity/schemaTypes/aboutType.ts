import { UserIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const aboutType = defineType({
  name: "about",
  title: "About",
  type: "document",
  icon: UserIcon,
  fields: [
    {
      name: "bio",
      title: "Bio",
      type: "blockContent",
    },
    defineField({
      name: "mainImage",
      type: "image",
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alternative text",
        },
      ],
    }),
    {
      name: "contributions",
      title: "Contributions",
      type: "array",
      of: [{ type: "contribution" }],
    },
  ],
});
