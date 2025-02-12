import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretRight } from "@fortawesome/free-solid-svg-icons";
import type { FC } from "react";
import clsx from "clsx";
import Link from "next/link";

export type BreadCrumbType = { title: string; href?: string };

type BreadCrumbsProps = {
  breadcrumbs: BreadCrumbType[];
  className?: string;
};

const BreadCrumbs: FC<BreadCrumbsProps> = ({ breadcrumbs, className }) => {
  return (
    <div className={clsx("mb-8", className)}>
      <ul className="flex gap-2 items-center">
        {breadcrumbs.map((link, idx) => (
          <li
            key={`${link.title}_${idx}`}
            className={clsx("flex", "items-center")}
          >
            {link.href ? (
              <Link
                className={clsx("text-sm font-normal", {
                  ["opacity-50"]: idx < breadcrumbs.length - 1,
                })}
                href={link.href}
              >
                {link.title}
              </Link>
            ) : (
              <span className={clsx("text-sm", "font-normal")}>
                {link.title}
              </span>
            )}
            <FontAwesomeIcon
              className={clsx("text-[0.5rem] ml-2 opacity-70", {
                ["hidden"]: idx === breadcrumbs.length - 1,
              })}
              style={{
                ...(idx === breadcrumbs.length - 1
                  ? { display: "none" }
                  : { display: "block" }),
              }}
              icon={faCaretRight}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BreadCrumbs;
