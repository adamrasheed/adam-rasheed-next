"use server";

import { FC } from "react";
import {
  CASE_STUDIES_PREVIEW_QUERYResult,
  HOME_QUERYResult,
} from "../../../sanity.types";
import { useNextSanityImage } from "next-sanity-image";
import { client } from "@/sanity/lib/client";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { PATHS } from "../_utils";

type CaseStudyPreviewProps =
  | HOME_QUERYResult["caseStudies"][0]
  | CASE_STUDIES_PREVIEW_QUERYResult[0];
const CaseStudyPreview: FC<CaseStudyPreviewProps> = ({
  title,
  mainImage,
  teaser,
  subtitle,
  slug,
  _id,
}) => {
  const imageProps = useNextSanityImage(client, mainImage);

  const link = `${PATHS.CASE_STUDIES}/${slug?.current}`;

  return (
    <div key={_id} className="case-study-preview">
      {imageProps && (
        <Link
          href={link}
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
        </Link>
      )}
      <div className="case-study-preview-content">
        <div>
          <h2 className="text-xl font-bold mb-2">{title}</h2>
          <Link className="btn" href={link}>
            Learn More
          </Link>
        </div>

        <div>
          <h3 className="case-study-subtitle">{subtitle}</h3>
          <p className="case-study-teaser">{teaser}</p>
        </div>
      </div>
    </div>
  );
};

export default CaseStudyPreview;
