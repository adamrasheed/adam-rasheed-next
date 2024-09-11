import { SiteInfoQueryRizzult } from "../_types";

const Footer = ({
  socialMedia,
  resume,
}: Pick<SiteInfoQueryRizzult[0], "socialMedia" | "resume">) => {
  return <footer>footer</footer>;
};

export default Footer;
