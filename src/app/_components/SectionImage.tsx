import { PortableTextBlock } from "@portabletext/types";
import { SanityImageObject } from "@sanity/image-url/lib/types/types";
import { EncodeDataAttributeCallback } from "@sanity/react-loader";
// import { image } from "@/sanity/lib/client";

import Blocks from "./Blocks";

type Props = {
  image: {
    image: SanityImageObject;
  };
  richtext: PortableTextBlock[];
  _key: string;
  sanity?: EncodeDataAttributeCallback;
};

export default function SectionImage({
  image: source,
  richtext,
  _key,
  sanity,
}: Props) {
  const hotspot = source.image.hotspot
    ? {
        objectPosition: `${source.image.hotspot.x * 100}% ${source.image.hotspot.y * 100}%`,
      }
    : undefined;

  return (
    <section className="...">
      <div
        className="..."
        data-sanity={sanity?.([`body:${_key}`, "image", "image"])}
      >
        {/* <img
          src={image(source.image)}
          width={400}
          height={1000}
          className="absolute h-full w-full object-cover"
          style={hotspot}
        /> */}
      </div>
      <div className="...">
        <Blocks value={richtext} />
      </div>
    </section>
  );
}
