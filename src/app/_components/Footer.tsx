import clsx from "clsx";
import { IconDefinition, library } from "@fortawesome/fontawesome-svg-core";
import {
  faFacebookF,
  faInstagramSquare,
  faInstagram,
  faYoutube,
  faLinkedinIn,
  faDribbble,
  faGithub,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SITE_INFO_QUERYResult } from "../../../sanity.types";

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

type SocialMediaKeys = keyof NonNullable<
  NonNullable<SITE_INFO_QUERYResult>["socialMedia"]
>;
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
  x: "hover:text-twitter focus:text-twitter",
};

type FooterProps = Pick<
  NonNullable<SITE_INFO_QUERYResult>,
  "resume" | "socialMedia"
>;

const Footer = ({ socialMedia, resume }: FooterProps) => {
  const year = new Date().getFullYear();

  const socialMediaArray = Object.entries(socialMedia || {});

  return (
    <footer className={clsx("py-6", "border-t")}>
      <div className={clsx("grid", "container", "md:grid-cols-2")}>
        <div className={clsx("flex", "gap-8", "justify-start", "items-center")}>
          <p className="text-sml leading-none">Adam Rasheed © {year}</p>
          {resume && (
            <a
              className="btn lrg"
              href={resume}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Resume
            </a>
          )}
        </div>
        {socialMedia && (
          <div
            data-testid="social-media"
            className={clsx(
              "flex",
              "container",
              "justify-center",
              "self-center",
              "items-center",
              "gap-4",
              "place-items-center"
            )}
          >
            {socialMediaArray.map(([key, value]) => (
              <a
                key={key}
                href={value}
                target="_blank"
                rel="noreferrer"
                title={value}
                className="min-w-6"
              >
                <FontAwesomeIcon
                  icon={socialMediaIconMap[key as SocialMediaKeys]}
                  aria-label={key}
                  className={clsx("footer_icon", socialHoverMap[key])}
                />
              </a>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
