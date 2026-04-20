"use client";

import clsx from "clsx";
import { ROUTES } from "../_utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_INFO_QUERYResult } from "../../../sanity.types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { useRef, useState } from "react";
import { showUnderline } from "./utils";
import MobileNav from "./MobileNav";
import CartDropdown from "./CartDropdown";
import { useCart } from "@/context/CartContext";

const name = "Adam Rasheed";

type HeaderProps = Pick<
  NonNullable<SITE_INFO_QUERYResult>,
  "title" | "socialMedia"
>;

const Header = ({ title = "Frontend Engineer", socialMedia }: HeaderProps) => {
  const currentPathFull = usePathname();
  const [isMenuShowing, setIsMenuShowing] = useState(false);
  const { cart, openCart, isOpen } = useCart();

  const headerRef = useRef<HTMLHeadingElement>(null);
  const headerHeight = headerRef.current?.clientHeight || 0;

  const currentPaths = currentPathFull.split("/");
  const isBlog = currentPaths.includes("blog");
  const isCaseStudy = currentPaths.includes("case-studies");
  const currentPath = currentPaths.pop();

  console.log({ currentPathFull });

  const showCart = currentPathFull.includes("ceramics");

  const itemCount =
    cart?.lines.edges.reduce((sum, e) => sum + e.node.quantity, 0) ?? 0;

  const handleMenuToggle = () => {
    setIsMenuShowing((prev: boolean) => !prev);
  };

  return (
    <header
      ref={headerRef}
      className={clsx(
        "relative",
        "container",
        "p-8",
        "grid",
        "gap-4",
        "items-center",
        "grid-cols-[auto_auto]",
        "lg:px-0",
      )}
    >
      <h1>
        <Link
          href="/"
          className={clsx(
            "grid",
            "items-center",
            "md:flex",
            "md:gap-1",
            "hover:no-underline",
          )}
        >
          <span
            className={clsx(
              "font-bold",
              "text-lg",
              "leading-none",
              "md:text-xl",
              'md:after:content-[""]',
              "md:after:h-4",
              "md:after:w-px",
              "md:after:inline-block",
              "md:after:bg-current",
              "md:after:mr-1",
              "md:after:ml-[8px]",
              "gap-1",
            )}
          >
            {name}
          </span>
          <span className={clsx("text-xs", "font-normal", "small-caps")}>
            {title}
          </span>
        </Link>
      </h1>

      {/* Mobile: cart icon + hamburger */}
      <div className="flex items-center gap-3 justify-self-end md:hidden">
        <div className="relative">
          {showCart && (
            <button
              onClick={openCart}
              className="relative flex items-center gap-1"
              aria-label="Open cart"
            >
              <FontAwesomeIcon icon={faCartShopping} className="text-base" />
              {itemCount > 0 && (
                <span className="text-xs font-semibold tabular-nums leading-none">
                  {itemCount}
                </span>
              )}
            </button>
          )}
          {showCart && isOpen && <CartDropdown />}
        </div>
        <button className="w-fit" onClick={handleMenuToggle}>
          <FontAwesomeIcon icon={faBars} />
        </button>
      </div>

      <MobileNav
        isShowing={isMenuShowing}
        currentPath={currentPath}
        isBlog={isBlog}
        isCaseStudy={isCaseStudy}
        socialMedia={socialMedia}
        headerHeight={headerHeight}
      />

      {/* Desktop nav */}
      <nav
        className={clsx(
          "hidden",
          "md:flex",
          "gap-4",
          "justify-end",
          "items-center",
        )}
      >
        {ROUTES.map((route) => (
          <Link
            href={route.href}
            key={route.href}
            className={clsx(
              "font-normal",
              "text-sm",
              "tracking-wider",
              "small-caps",
              {
                [`underline`]: showUnderline({
                  currentPath,
                  href: route.href,
                  isBlog,
                  isCaseStudy,
                }),
              },
            )}
          >
            {route.label}
          </Link>
        ))}

        {showCart && (
          <div className="relative">
            <button
              onClick={openCart}
              className="flex items-center gap-1.5 font-normal text-base"
              aria-label="Open cart"
            >
              <FontAwesomeIcon
                icon={faCartShopping}
                className="text-base size-3"
              />
              {itemCount > 0 && (
                <span className="text-xs font-semibold tabular-nums leading-none">
                  {itemCount}
                </span>
              )}
            </button>
            {isOpen && <CartDropdown />}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
