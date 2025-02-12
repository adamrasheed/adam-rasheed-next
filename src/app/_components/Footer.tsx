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
import { SITE_INFO_QUERYResult } from "../../../sanity.types";
import SocialMediaList from "./SocialMediaList";

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

type FooterProps = Pick<
  NonNullable<SITE_INFO_QUERYResult>,
  "resume" | "socialMedia"
>;

const Footer = ({ socialMedia, resume }: FooterProps) => {
  const year = new Date().getFullYear();

  return (
    <footer className={clsx("py-4", "lg:py-8", "border-t")}>
      <div
        className={clsx(
          "grid",
          "container",
          "gap-4",
          "justify-center",
          "md:grid-cols-2"
        )}
      >
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
        <SocialMediaList socialMedia={socialMedia} />
      </div>
    </footer>
  );
};

export default Footer;
