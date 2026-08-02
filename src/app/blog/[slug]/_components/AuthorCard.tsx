import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { PATHS } from "@/app/_utils";
import { SITE_NAME } from "@/constants";
import { urlFor } from "@/sanity/lib/image";
import { SINGLE_POST_QUERYResult } from "../../../../../sanity.types";

type AuthorType = NonNullable<SINGLE_POST_QUERYResult>["author"];

// Rendered at 56px, so ask the CDN for a 2x square.
const AVATAR_SOURCE_PX = 112;
const AVATAR_DISPLAY_PX = 56;

const AuthorCard = ({ author }: { author: AuthorType }) => {
  if (!author) return null;

  // siteInfo.title is the tagline ("Frontend Software Engineer"), not the name.
  const { title: role, email, authorBio, authorImage } = author;

  const name = SITE_NAME;

  const avatarBuilder = authorImage?.asset
    ? urlFor(authorImage)
        .width(AVATAR_SOURCE_PX)
        .height(AVATAR_SOURCE_PX)
        .fit("crop")
        .auto("format")
    : null;

  // With a hotspot set in the studio the builder crops around it. Without one
  // the default is a centre crop, which takes the middle band of a portrait and
  // cuts the top of the head off — so bias to the top instead.
  const avatarUrl = avatarBuilder
    ? (authorImage?.hotspot ? avatarBuilder : avatarBuilder.crop("top")).url()
    : null;

  // Deliberately a <div>: globals.css has a global `section { py-10 ... }` rule
  // that would add ~96px of padding above and below at desktop widths.
  return (
    <div className="space-y-3">
      <h2
        className={clsx(
          "accent",
          "lrg",
          "leading-none",
          "font-semibold",
          "text-base",
          "small-caps"
        )}
      >
        Written by
      </h2>

      <div className={clsx("flex", "items-center", "gap-3")}>
        {avatarUrl && (
          <Image
            src={avatarUrl}
            alt={authorImage?.alt || name}
            width={AVATAR_DISPLAY_PX}
            height={AVATAR_DISPLAY_PX}
            className={clsx("rounded-md", "shrink-0", "object-cover")}
          />
        )}
        <div>
          <p className={clsx("font-semibold", "leading-tight")}>{name}</p>
          {role && (
            <p className={clsx("text-xs", "small-caps", "letter-spacing")}>
              {role}
            </p>
          )}
        </div>
      </div>

      {authorBio && (
        <p className={clsx("text-sm", "leading-snug")}>{authorBio}</p>
      )}

      <div className={clsx("flex", "flex-wrap", "gap-2", "items-center")}>
        <Link href={PATHS.CASE_STUDIES} className="btn">
          See my work
        </Link>
        {email && (
          <a href={`mailto:${email}`} className={clsx("btn", "primary")}>
            Work with me
          </a>
        )}
      </div>
    </div>
  );
};

export default AuthorCard;
