export const PATHS = {
  ABOUT: "/about",
  BLOG: "/blog",
  CASE_STUDIES: "/case-studies",
  FREELANCE: "/freelance",
};

export const ROUTES = [
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Case Studies",
    href: "/case-studies",
  },
  {
    label: "Blog",
    href: "/blog",
  },
  {
    label: "Freelance",
    href: "/freelance",
  },
];

export const getFormattedDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
