import { defineType } from "sanity";

export const barSessionType = defineType({
  name: "barSession",
  title: "Bar Session",
  type: "document",
  description: "The open/closed switch for taking orders on /bar",
  fields: [
    {
      name: "open",
      title: "Bar is open",
      type: "boolean",
      description:
        "When off, /bar is a read-only menu and the order API rejects every write.",
      initialValue: false,
    },
    {
      name: "openedAt",
      title: "Opened at",
      type: "datetime",
      description: "Set automatically when the bar is opened from /bar/host",
      readOnly: true,
    },
  ],
  preview: {
    select: { open: "open", openedAt: "openedAt" },
    prepare({ open, openedAt }) {
      return {
        title: open ? "Bar is open" : "Bar is closed",
        subtitle: open && openedAt ? `Since ${openedAt}` : undefined,
      };
    },
  },
});
