import { FC } from "react";
import { CASE_STUDY_BY_SLUG_QUERYResult } from "../../../../../sanity.types";
import BreadCrumbs, { BreadCrumbType } from "@/app/_components/Breadcrumbs";
import { useNextSanityImage } from "next-sanity-image";
import { client } from "@/sanity/lib/client";
import Image from "next/image";
import clsx from "clsx";
import RichText from "@/app/_components/RichText";

type CaseStudyProps = NonNullable<CASE_STUDY_BY_SLUG_QUERYResult>;

const CaseStudy: FC<CaseStudyProps> = ({ title, mainImage, description }) => {
  const imageProps = useNextSanityImage(client, mainImage);
  const breadCrumbs: BreadCrumbType[] = [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Case Studies",
      href: "/case-studies",
    },
    {
      title: title || "",
    },
  ];

  return (
    <div className="container lg:px-0">
      <BreadCrumbs breadcrumbs={breadCrumbs} />
      <p className="my-2 small-caps">Case Study</p>
      <h1 className="page-title">{title}</h1>
      {imageProps && (
        <div
          style={{ aspectRatio: `${imageProps.width} / ${imageProps.height}` }}
          className={clsx("relative", "block", "overflow-hidden")}
        >
          <Image
            src={imageProps.src}
            layout="fill"
            alt={mainImage?.alt || ""}
            style={{
              objectFit: "contain",
            }}
          />
        </div>
      )}

      {description && (
        <div className="sml my-16 lg:mb-24">
          <RichText
            className="mx-auto prose-images"
            imgClassName="prose-image"
            content={description}
          />
        </div>
      )}
    </div>
  );
};

export default CaseStudy;
