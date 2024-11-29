import { FC } from "react";
import { ABOUT_QUERYResult } from "../../../../sanity.types";
import clsx from "clsx";
import { PortableText } from "next-sanity";
import { useNextSanityImage } from "next-sanity-image";
import { client } from "@/sanity/lib/client";
import Image from "next/image";
import Contribution from "./Contribution";
import { getFormattedDate } from "@/app/_utils";

type AboutProps = NonNullable<ABOUT_QUERYResult>;
const About: FC<AboutProps> = ({
  bio,
  contributions,
  mainImage,
  _updatedAt,
}) => {
  const imageProps = useNextSanityImage(client, mainImage);

  // const hasBio = bio && bio.length > 0;
  const hasContributions = contributions && contributions.length > 0;
  const updatedAt = _updatedAt;

  return (
    <div data-testid="AboutPage" className="container px-0">
      <h1 className="page-title">{"About"}</h1>
      {imageProps && (
        <div
          style={{ aspectRatio: `${imageProps.width} / ${imageProps.height}` }}
          className={clsx("relative", "block", "overflow-hidden")}
        >
          <Image
            src={imageProps.src}
            // loader={imageProps.loader}
            layout="fill"
            alt={mainImage?.alt || ""}
            style={{
              objectFit: "contain",
            }}
          />
        </div>
      )}

      <div className={clsx("grid", "md:grid-cols-[2fr_1fr]", "gap-8", "my-8")}>
        <div>
          {bio && (
            <>
              <article className={clsx("prose", "dark:prose-invert")}>
                <PortableText value={bio} />
              </article>
              {updatedAt && (
                <p className="text-sm mt-8">{`Last updated: ${getFormattedDate(updatedAt)}`}</p>
              )}
            </>
          )}
        </div>
        <aside>
          {hasContributions &&
            contributions.map((con) => (
              <Contribution key={con._key} {...con} />
            ))}
        </aside>
      </div>
    </div>
  );
};

export default About;
