import clsx from "clsx";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faFacebookF,
  faInstagramSquare,
  faTwitter,
  faInstagram,
  faYoutube,
  faLinkedinIn,
  faDribbble,
  faGithub,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SiteInfoQueryRizzult } from "../_types";

library.add(
  faFacebookF,
  faInstagramSquare,
  faTwitter,
  faInstagram,
  faLinkedinIn,
  faDribbble,
  faGithub,
  faYoutube
);

const socialHoverMap: Record<string, string> = {
  instagram: "hover:text-instagram focus:text-instagram",
  facebook: "hover:text-facebook focus:text-facebook",
  youtube: "hover:text-youtube focus:text-youtube",
  dribbble: "hover:text-dribbble focus:text-dribbble",
  linkedin: "hover:text-linkedin focus:text-linkedin",
  twitter: "hover:text-twitter focus:text-twitter",
};

const Footer = ({
  socialMedia,
  resume,
}: Pick<SiteInfoQueryRizzult[0], "socialMedia" | "resume">) => {
  const year = new Date().getFullYear();

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
        <div
          data-testid="social-media"
          className={clsx(
            "flex",
            "container",
            "justify-center",
            "self-center",
            "items-center",
            "gap-6",
            "place-items-center"
          )}
        >
          {socialMedia.github && (
            <a
              href={socialMedia.github}
              target="_blank"
              rel="noreferrer"
              title={socialMedia.github}
            >
              <FontAwesomeIcon
                icon={faGithub}
                aria-label={"github"}
                className="footer_icon"
              />
            </a>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
