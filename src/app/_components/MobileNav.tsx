"use client";

import clsx from "clsx";
import { FC, useEffect, useState } from "react";
import { ROUTES } from "../_utils";
import Link from "next/link";
import { showUnderline } from "./utils";
import { SITE_INFO_QUERYResult } from "../../../sanity.types";
import SocialMediaIcons from "./SocialMediaList";

type MobileNavProps = {
  isShowing?: boolean;
  currentPath?: string;
  isBlog?: boolean;
  isCaseStudy?: boolean;
  className?: string;
  itemClassName?: string;
  headerHeight?: number;
  socialMedia?: NonNullable<SITE_INFO_QUERYResult>["socialMedia"];
};
const MobileNav: FC<MobileNavProps> = ({
  isShowing = false,
  currentPath,
  isBlog,
  isCaseStudy,
  className,
  itemClassName,
  headerHeight,
  socialMedia,
}) => {
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isShowing) {
      const scrollY = window.scrollY;

      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.documentElement.style.overflow = "hidden";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.documentElement.style.overflow = "";

      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.documentElement.style.overflow = "";
    };
  }, [isShowing]);

  useEffect(() => {
    if (isShowing) {
      setMounted(true);
      const timer = setTimeout(() => setIsAnimating(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isShowing]);

  if (!mounted) return null;

  return (
    <div
      data-testid="mobileNav"
      style={{
        top: headerHeight ? `${headerHeight}px` : "0px",
        height: `calc(100svh - ${headerHeight}px)`,
      }}
      className={clsx(
        "flex",
        "flex-col",
        "z-10",
        "p-8",
        "absolute",
        "w-full",
        "transition-all",
        "duration-300",
        "bg-background",
        "md:hidden",
        className,
        {
          ["translate-x-0"]: isAnimating,
          ["translate-x-[-100%]"]: !isAnimating,
        }
      )}
    >
      <nav
        className={clsx(
          "my-auto",
          "flex",
          "flex-col",
          "gap-4",
          "justify-center",
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
      <SocialMediaIcons className="mt-auto gap-8" socialMedia={socialMedia} />
    </div>
  );
};

export default MobileNav;
