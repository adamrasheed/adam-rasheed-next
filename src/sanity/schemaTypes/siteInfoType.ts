import { defineType } from "sanity";

export const siteInfo = defineType({
  name: "siteInfo",
  title: "Site Info",
  type: "document",
  description: "Information about the site",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      description: "The title of the site",
    },
    {
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
      description: "A description of the site",
    },
    {
      name: "email",
      title: "Email",
      type: "email",
      description: "Contact email address",
    },
    {
      name: "resume",
      title: "Resume Link",
      type: "url",
      description: "Link to your resume",
    },
    {
      name: "socialMedia",
      title: "Social Media Links",
      type: "object",
      fields: [
        {
          name: "x",
          title: "X",
          type: "url",
        },
        {
          name: "instagram",
          title: "Instagram",
          type: "url",
        },
        {
          name: "linkedIn",
          title: "LinkedIn",
          type: "url",
        },
        {
          name: "github",
          title: "GitHub",
          type: "url",
        },
        {
          name: "youtube",
          title: "YouTube",
          type: "url",
        },
      ],
    },
  ],
});
