import { PortableText } from "@portabletext/react";
import { PortableTextBlock } from "@portabletext/types";
import { EncodeDataAttributeCallback } from "@sanity/react-loader";

import SectionImage from "./SectionImage";

type Props = {
  value: PortableTextBlock[];
  sanity?: EncodeDataAttributeCallback;
};

export default function Blocks({ value, sanity }: Props) {
  let div: PortableTextBlock[] = [];
  return value.map((block, i, blocks) => {
    // Normal text blocks (p, h1, h2, etc.) — these are grouped so we can wrap them in a prose div
    if (block._type === "block") {
      div.push(block);

      // If the next block is also text, group it with this one
      if (blocks[i + 1]?._type === "block") return null;

      // Otherwise, render the group of text blocks we have
      const value = div;
      div = [];

      return (
        <div
          key={block._key}
          className="prose-lg prose-h2:max-w-[32ch] prose-h2:text-5xl"
        >
          <PortableText
            value={value}
            components={{
              marks: {
                // ...
              },
            }}
          />
        </div>
      );
    } else {
      // Non-text blocks (modules, sections, etc.) — note that these can recursively render text
      // blocks again
      return (
        <PortableText
          key={block._key}
          value={block}
          components={{
            types: {
              "section.image": ({ value }) => (
                <SectionImage {...value} sanity={sanity} />
              ),
              // ...
            },
          }}
        />
      );
    }
  });
}
