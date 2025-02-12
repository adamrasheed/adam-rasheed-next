import { client } from "@/sanity/lib/client";
import { useNextSanityImage } from "next-sanity-image";
import Image from "next/image";
import { SanityMainImage } from "../_types";
import { FC } from "react";
import clsx from "clsx";

type SanityImageProps = {
  img: SanityMainImage;
  alt?: string;
  className?: string;
};
const SanityImage: FC<SanityImageProps> = ({ img, alt = "", className }) => {
  const imageProps = useNextSanityImage(client, img);

  if (!imageProps) return null;

  return (
    <div
      style={{ aspectRatio: `${imageProps.width} / ${imageProps.height}` }}
      className={clsx("relative", "block", "overflow-hidden", className)}
    >
      <Image
        src={imageProps.src}
        layout="fill"
        alt={alt || img?.alt || ""}
        style={{
          objectFit: "contain",
        }}
      />
    </div>
  );
};

export default SanityImage;
