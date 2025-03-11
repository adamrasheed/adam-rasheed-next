import { ComposeIcon } from "@sanity/icons";
import { defineType } from "sanity";

export default defineType({
  name: "caseStudy",
  title: "Case Study",
  icon: ComposeIcon,
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: "subtitle",
      title: "Subtitle",
      type: "string",
    },
    {
      name: "teaser",
      title: "Teaser Text",
      type: "text",
      validation: (Rule) => Rule.required(),
    },
    {
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
        {
          name: "border",
          type: "boolean",
          title: "Add a border",
          description: "Add a border to the image",
        },
      ],
    },
    {
      name: "link",
      type: "url",
      title: "Link",
      description: "Link to the project",
      validation: (Rule) => Rule.optional(),
    },
    {
      name: "description",
      title: "Description",
      type: "array",
      of: [
        { type: "block" },
        {
          type: "image",
          fields: [
            {
              type: "text",
              name: "alt",
              title: "Alternative text",
              description: `Some of your visitors cannot see images, 
            be they blind, color-blind, low-sighted; 
            alternative text is of great help for those 
            people that can rely on it to have a good idea of 
            what\'s on your page.`,
              options: {
                isHighlighted: true,
              },
            },
          ],
        },
      ],
      validation: (Rule) => Rule.required(),
    },
  ],
});
