export const PATHS = {
  ABOUT: "/about",
  BLOG: "/blog",
  CASE_STUDIES: "/case-studies",
  FREELANCE: "/freelance",
};

export const ROUTES = [
  {
    label: "About",
    href: PATHS.ABOUT,
  },
  {
    label: "Case Studies",
    href: PATHS.CASE_STUDIES,
  },
  {
    label: "Blog",
    href: PATHS.BLOG,
  },
  {
    label: "Freelance",
    href: PATHS.FREELANCE,
  },
];

export const getFormattedDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
