"use client";

import clsx from "clsx";
import { ROUTES } from "../_utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_INFO_QUERYResult } from "../../../sanity.types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { useRef, useState } from "react";
import { showUnderline } from "./utils";
import MobileNav from "./MobileNav";

const name = "Adam Rasheed";

type HeaderProps = Pick<
  NonNullable<SITE_INFO_QUERYResult>,
  "title" | "socialMedia"
>;
const Header = ({ title = "Frontend Engineer", socialMedia }: HeaderProps) => {
  const currentPathFull = usePathname();
  const [isMenuShowing, setIsMenuShowing] = useState(false);

  const headerRef = useRef<HTMLHeadingElement>(null);

  const headerHeight = headerRef.current?.clientHeight || 0;

  const currentPaths = currentPathFull.split("/");
  const isBlog = currentPaths.includes("blog");
  const isCaseStudy = currentPaths.includes("case-studies");
  const currentPath = currentPaths.pop();

  const handleMenuToggle = () => {
    setIsMenuShowing((prev: boolean) => !prev);
  };

  return (
    <header
      ref={headerRef}
      className={clsx(
        "relative",
        "container",
        "px-4",
        "py-8",
        "grid",
        "gap-4",
        "items-center",
        "grid-cols-[auto_auto]",
        "lg:px-0"
      )}
    >
      <h1>
        <Link
          href="/"
          className={clsx(
            "flex",
            "items-center",
            "gap-1",
            "hover:no-underline"
          )}
        >
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

      <button
        className="w-fit justify-self-end md:hidden"
        onClick={handleMenuToggle}
      >
        <FontAwesomeIcon icon={faBars} />
      </button>

      <MobileNav
        isShowing={isMenuShowing}
        currentPath={currentPath}
        isBlog={isBlog}
        isCaseStudy={isCaseStudy}
        socialMedia={socialMedia}
        headerHeight={headerHeight}
      />

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
    </header>
  );
};

export default Header;
