import { PATHS } from "../_utils";

type ShowUnderLineArgs = {
  href: string;
  currentPath?: string;
  isBlog?: boolean;
  isCaseStudy?: boolean;
};
export const showUnderline = ({
  currentPath,
  href,
  isBlog,
  isCaseStudy,
}: ShowUnderLineArgs): boolean => {
  return Boolean(
    currentPath === href.split("/").pop() ||
      (href === PATHS.BLOG && isBlog) ||
      (href === PATHS.CASE_STUDIES && isCaseStudy)
  );
};
