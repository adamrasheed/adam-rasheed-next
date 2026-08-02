"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";
import type { PostHeading } from "@/app/_utils";

// Roughly where the eye sits: a heading counts as "current" once it has passed
// this far up the viewport.
const ACTIVE_OFFSET_PX = 140;

const PostToc = ({ headings }: { headings: PostHeading[] }) => {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? "");

  // Depend on the id list rather than the array so a new array identity from a
  // parent re-render does not tear down the listener.
  const idKey = headings.map((heading) => heading.id).join("|");

  useEffect(() => {
    const ids = idKey ? idKey.split("|") : [];
    if (!ids.length) return;

    let frame = 0;

    const update = () => {
      frame = 0;

      // The last heading above the line wins. An IntersectionObserver leaves
      // gaps here: scroll into the middle of a long section and no heading is
      // intersecting, so nothing would be highlighted.
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top > ACTIVE_OFFSET_PX) break;
        current = id;
      }

      // The final section is often too short to ever reach the line, so it
      // would never light up without this.
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      if (atBottom) current = ids[ids.length - 1];

      setActiveId(current);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [idKey]);

  // One heading is a list of one, which reads as noise rather than navigation.
  if (headings.length < 2) return null;

  return (
    <nav aria-label="Table of contents" className="space-y-3">
      <h2
        className={clsx(
          "accent",
          "lrg",
          "leading-none",
          "font-semibold",
          "text-base",
          "small-caps"
        )}
      >
        On this page
      </h2>
      {/* Plain `border-l` picks up the same default border color the rest of
          the site uses. */}
      <ul className={clsx("space-y-1.5", "border-l")}>
        {headings.map((heading) => {
          const isActive = heading.id === activeId;

          return (
            <li key={heading._key}>
              <a
                href={`#${heading.id}`}
                aria-current={isActive ? "location" : undefined}
                className={clsx(
                  "block",
                  "text-sm",
                  "leading-snug",
                  "-ml-px",
                  "border-l-2",
                  "pl-3",
                  "transition-colors",
                  heading.level === 3 && "pl-6",
                  isActive
                    ? ["border-current", "font-semibold"]
                    : ["border-transparent", "font-normal", "opacity-70"]
                )}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default PostToc;
