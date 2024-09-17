"use client";

import clsx from "clsx";
import { PATHS, ROUTES } from "../_utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_INFO_QUERYResult } from "../../../sanity.types";

const name = "Adam Rasheed";

type HeaderProps = Pick<NonNullable<SITE_INFO_QUERYResult>, "title">;
const Header = ({ title = "Frontend Engineer" }: HeaderProps) => {
  const currentPathFull = usePathname();

  const currentPaths = currentPathFull.split("/");
  const isBlog = currentPaths.includes("blog");
  const isCaseStudy = currentPaths.includes("case-studies");
  const currentPath = currentPaths.pop();

  return (
    <header
      className={clsx(
        "my-8",
        "container",
        "px-4",
        "grid",
        "gap-4",
        "items-center",
        "grid-cols-[auto_auto]"
      )}
    >
      <h1>
        <Link href="/" className={clsx("flex", "items-center", "gap-1")}>
          <span
            className={clsx(
              "font-bold",
              "text-xl",
              'after:content-[""]',
              "after:h-4",
              "after:w-px",
              "after:inline-block",
              "after:bg-current",
              "after:mr-1",
              "after:ml-[8px]",
              "gap-1"
            )}
          >
            {name}
          </span>
          <span className={clsx("text-sm", "font-normal", "small-caps")}>
            {title}
          </span>
        </Link>
      </h1>

      <nav
        className={clsx(
          "hidden",
          "md:flex",
          "gap-4",
          "justify-end",
          "items-center"
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
              {
                [`underline`]:
                  currentPath === route.href.split("/").pop() ||
                  (route.href === PATHS.BLOG && isBlog) ||
                  (route.href === PATHS.CASE_STUDIES && isCaseStudy),
              }
            )}
          >
            {route.label}
          </Link>
        ))}
      </nav>
    </header>
  );
};

export default Header;
