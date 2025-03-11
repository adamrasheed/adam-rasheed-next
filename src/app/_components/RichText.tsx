import { PortableText } from "next-sanity";
import SanityImage from "./SanityImage";
import clsx from "clsx";
import { TypedObject } from "sanity";

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
