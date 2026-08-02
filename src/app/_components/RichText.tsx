import { PortableText } from "next-sanity";
import SanityImage from "./SanityImage";
import clsx from "clsx";
import { TypedObject } from "sanity";
import Link from "next/link";
import type { PortableTextComponents } from "@portabletext/react";

/**
 * `headingIds` maps a block `_key` to the anchor id the table of contents links
 * to. Callers that have no TOC can omit it and headings render unchanged.
 */
export const richTextComponents = (
  imgClassName?: string,
  headingIds?: Record<string, string>
): PortableTextComponents => ({
  types: {
    image: ({ value }) => <SanityImage img={value} className={imgClassName} />,
  },
  marks: {
    link: ({ value, children }) => {
      const href = value?.href || "";

      // href is optional in the blockContent schema, and an empty one renders
      // an anchor pointing back at the current page. Drop the anchor instead.
      if (!href) return <>{children}</>;

      const isExternal = href.startsWith("http") || href.startsWith("mailto:");

      if (isExternal) {
        return (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        );
      }

      return <Link href={href}>{children}</Link>;
    },
  },
  block: {
    h1: ({ children }) => (
      <h1 className={clsx("font-black", "text-4xl")}>{children}</h1>
    ),
    // No className on purpose: prose already styles these, and the only reason
    // to override them is to stamp the anchor id.
    h2: ({ children, value }) => (
      <h2 id={headingIds?.[value?._key ?? ""]}>{children}</h2>
    ),
    h3: ({ children, value }) => (
      <h3 id={headingIds?.[value?._key ?? ""]}>{children}</h3>
    ),
  },
});

type RichTextProps<TValue extends TypedObject | TypedObject[]> = {
  content: TValue;
  className?: string;
  imgClassName?: string;
};

const RichText = <TValue extends TypedObject | TypedObject[]>({
  content,
  className,
  imgClassName,
}: RichTextProps<TValue>) => {
  return (
    <div className={clsx("prose dark:prose-invert", className)}>
      <PortableText
        value={content}
        components={richTextComponents(imgClassName)}
      />
    </div>
  );
};

export default RichText;
