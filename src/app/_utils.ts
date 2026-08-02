export const PATH_NAMES = {
  ABOUT: "About",
  BLOG: "Blog",
  CASE_STUDIES: "Case Studies",
  CERAMICS: "Ceramics",
  FREELANCE: "Freelance",
};
export const PATHS = {
  ABOUT: "/about",
  BLOG: "/blog",
  CASE_STUDIES: "/case-studies",
  CERAMICS: "https://adamrasheed.studio/",
  FREELANCE: "/freelance",
};

export const ROUTES = [
  {
    label: PATH_NAMES.ABOUT,
    href: PATHS.ABOUT,
  },
  {
    label: PATH_NAMES.CASE_STUDIES,
    href: PATHS.CASE_STUDIES,
  },
  {
    label: PATH_NAMES.BLOG,
    href: PATHS.BLOG,
  },
  {
    label: PATH_NAMES.CERAMICS,
    href: PATHS.CERAMICS,
    external: true,
  },
];

export const getFormattedDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const slugifyHeading = (text: string) =>
  text
    .toLowerCase()
    .replace(/['’"“”]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export type PostHeading = {
  _key: string;
  id: string;
  text: string;
  level: 2 | 3;
};

/** Loose shape so this works for any portable text field without importing the
 *  generated per-query types, which differ block by block. */
type BlockLike = {
  _type?: string;
  _key?: string;
  style?: string;
  children?: Array<{ _type?: string; text?: string }> | null;
};

/**
 * Headings for the sidebar table of contents. The `_key` comes along so the
 * renderer can stamp the exact same id on the heading it emits — deriving the
 * slug twice would drift apart the moment two headings share a title.
 */
export const getPostHeadings = (
  body: readonly BlockLike[] | null | undefined
): PostHeading[] => {
  if (!body) return [];

  const seen = new Map<string, number>();

  return body.reduce<PostHeading[]>((headings, block) => {
    if (block?._type !== "block") return headings;
    if (block.style !== "h2" && block.style !== "h3") return headings;

    const text = (block.children ?? [])
      .filter((child) => child?._type === "span")
      .map((child) => child?.text ?? "")
      .join("")
      .trim();

    if (!text || !block._key) return headings;

    // Anchors have to be unique even when two sections are named the same.
    const base = slugifyHeading(text) || "section";
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);

    headings.push({
      _key: block._key,
      id: count > 1 ? `${base}-${count}` : base,
      text,
      level: block.style === "h2" ? 2 : 3,
    });

    return headings;
  }, []);
};
