import clsx from "clsx";
import { FC } from "react";
import { ROUTES } from "../_utils";
import Link from "next/link";
import { showUnderline } from "./utils";

type MobileNavProps = {
  isShowing?: boolean;
  currentPath?: string;
  isBlog?: boolean;
  isCaseStudy?: boolean;
  className?: string;
  itemClassName?: string;
};
const MobileNav: FC<MobileNavProps> = ({
  isShowing,
  currentPath,
  isBlog,
  isCaseStudy,
  className,
  itemClassName,
}) => {
  return (
    <nav
      data-testid="mobileNav"
      className={clsx(
        "flex",
        "z-10",
        "absolute",
        "top-0",
        "w-full",
        "h-lvh",
        "flex-col",
        "transition-all",
        "bg-white",
        "text-black",
        "md:hidden",
        "gap-4",
        "justify-center",
        "items-center",
        className,
        {
          ["translate-x-0"]: isShowing,
          ["translate-x-[-100%]"]: !isShowing,
        }
      )}
    >
      {ROUTES.map((route) => (
        <Link
          href={route.href}
          key={route.href}
          className={clsx(
            "font-normal",
            "text-sm",
            "letter-spacing",
            "small-caps",
            itemClassName,
            {
              [`underline`]: showUnderline({
                currentPath,
                href: route.href,
                isBlog,
                isCaseStudy,
              }),
            }
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  );
};

export default MobileNav;
