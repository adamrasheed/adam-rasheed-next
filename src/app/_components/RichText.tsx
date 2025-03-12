import { PortableText } from "next-sanity";
import SanityImage from "./SanityImage";
import clsx from "clsx";
import { TypedObject } from "sanity";
import Link from "next/link";

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
        components={{
          types: {
            image: ({ value }) => (
              <SanityImage img={value} className={imgClassName} />
            ),
          },
          marks: {
            link: ({ value, children }) => {
              const href = value?.href || "";
              const isExternal =
                href.startsWith("http") || href.startsWith("mailto:");

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
          },
        }}
      />
    </div>
  );
};

export default RichText;
