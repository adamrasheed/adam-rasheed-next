import { DocumentTextIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const postType = defineType({
  name: "post",
  title: "Post",
  type: "document",
  icon: DocumentTextIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      type: "string",
      group: "content",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      group: "content",
      options: {
        source: "title",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "excerpt",
      type: "text",
      rows: 3,
      group: "content",
      description: "Shown in listings, the RSS feed, and as the default share description.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "mainImage",
      title: "Cover image",
      type: "image",
      group: "content",
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "Alternative text",
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "caption",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "author",
      type: "reference",
      to: [{ type: "author" }],
      group: "content",
      description: "Leave empty to use the author from Site Info.",
    }),
    defineField({
      name: "categories",
      type: "array",
      group: "content",
      description: "Add “Travel” to list the post on /travel.",
      of: [defineArrayMember({ type: "reference", to: { type: "category" } })],
    }),
    defineField({
      name: "tags",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
    }),
    defineField({
      name: "publishedAt",
      type: "datetime",
      group: "content",
      description: "A future date keeps the post off listings until then.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "updatedAt",
      type: "datetime",
      group: "content",
      description: "Set when you make a meaningful revision. Typo fixes don't count.",
    }),
    defineField({
      name: "body",
      type: "blockContent",
      group: "content",
    }),
    defineField({
      name: "seoTitle",
      type: "string",
      group: "seo",
      description: "Overrides the title in search results and share cards.",
      validation: (Rule) => Rule.max(70).warning("Search engines truncate past ~60 characters."),
    }),
    defineField({
      name: "seoDescription",
      type: "text",
      rows: 2,
      group: "seo",
      description: "Overrides the excerpt in search results and share cards.",
      validation: (Rule) => Rule.max(160).warning("Search engines truncate past ~155 characters."),
    }),
  ],
  orderings: [
    {
      title: "Published, newest",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      media: "mainImage",
      publishedAt: "publishedAt",
    },
    prepare: ({ title, media, publishedAt }) => ({
      title,
      media,
      subtitle: publishedAt ? new Date(publishedAt).toLocaleDateString() : "No date",
    }),
  },
});
