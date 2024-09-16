import { FC } from "react";
import { ABOUT_QUERYResult } from "../../../../sanity.types";
import clsx from "clsx";
import { PortableText } from "next-sanity";
import { useNextSanityImage } from "next-sanity-image";
import { client } from "@/sanity/lib/client";

type AboutProps = NonNullable<ABOUT_QUERYResult>;
const About: FC<AboutProps> = ({
  bio,
  contributions,
  mainImage,
  _updatedAt,
}) => {
  console.log("AboutProps", { bio, contributions, mainImage, _updatedAt });
  const imageProps = useNextSanityImage(client, mainImage);
  return (
    <div>
      {imageProps && (
        
      )}
      <div className={clsx("grid", "md:grid-cols-[1fr_auto]", "gap-2", "mb-4")}>
        <div>
          {bio && (
            <div className={clsx("prose")}>
              <PortableText
                value={bio}
                components={{
                  block: {
                    h1: ({ children }) => (
                      <h1 className={clsx("font-black", "text-4xl")}>
                        {children}
                      </h1>
                    ),
                  },
                }}
              />
            </div>
          )}
        </div>
        <aside>sidebar</aside>
      </div>
    </div>
  );
};

export default About;
