import { FC } from "react";
import { SITE_INFO_QUERYResult } from "../../../sanity.types";
import clsx from "clsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition, library } from "@fortawesome/fontawesome-svg-core";
import {
  faDribbble,
  faFacebookF,
  faGithub,
  faInstagram,
  faInstagramSquare,
  faLinkedinIn,
  faXTwitter,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

library.add(
  faFacebookF,
  faInstagramSquare,
  faXTwitter,
  faInstagram,
  faLinkedinIn,
  faDribbble,
  faGithub,
  faYoutube
);

type SocialMedia = NonNullable<SITE_INFO_QUERYResult>["socialMedia"];

type SocialMediaKeys = keyof SocialMedia;

type SocialMediaIconsProps = {
  socialMedia?: SocialMedia;
  className?: string;
  itemClassName?: string;
};

const socialMediaIconMap: Record<SocialMediaKeys, IconDefinition> = {
  instagram: faInstagram,
  youtube: faYoutube,
  dribbble: faDribbble,
  github: faGithub,
  linkedIn: faLinkedinIn,
  x: faXTwitter,
};

const socialHoverMap: Record<string, string> = {
  instagram: "hover:text-instagram focus:text-instagram",
  facebook: "hover:text-facebook focus:text-facebook",
  youtube: "hover:text-youtube focus:text-youtube",
  dribbble: "hover:text-dribbble focus:text-dribbble",
  faGithub: "hover:text-github focus:text-github",
  linkedIn: "hover:text-linkedin focus:text-linkedin",
  x: "hover:text-x focus:text-x",
};

const SocialMediaIcons: FC<SocialMediaIconsProps> = ({
  socialMedia,
  className,
  itemClassName,
}) => {
  const socialMediaArray = Object.entries(socialMedia || {});

  if (!socialMedia) return null;

  return (
    <div
      data-testid="social-media"
      className={clsx(
        "flex",
        "container",
        "justify-center",
        "self-center",
        "items-center",
        "gap-4",
        "place-items-center",
        className
      )}
    >
      {socialMediaArray.map(([key, value]) => (
        <a
          key={key}
          href={value}
          target="_blank"
          rel="noreferrer"
          title={value}
          className={clsx("min-w-6", itemClassName)}
        >
          <FontAwesomeIcon
            title={key}
            icon={socialMediaIconMap[key as SocialMediaKeys]}
            aria-label={key}
            className={clsx("footer_icon", socialHoverMap[key])}
          />
        </a>
      ))}
    </div>
  );
};

export default SocialMediaIcons;
