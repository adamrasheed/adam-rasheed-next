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
  CERAMICS: "/ceramics",
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
  },
];

export const getFormattedDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
