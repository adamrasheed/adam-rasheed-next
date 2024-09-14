// Bc Sanity screwed Up

import { SanityImageCrop, SanityImageHotspot } from "../../sanity.types";

type Block = Array<
  | {
      children?: Array<{
        marks?: Array<string>;
        text?: string;
        _type: "span";
        _key: string;
      }>;
      style?: "normal" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "blockquote";
      listItem?: "bullet" | "number";
      markDefs?: Array<{
        href?: string;
        _type: "link";
        _key: string;
      }>;
      level?: number;
      _type: "block";
      _key: string;
    }
  | {
      asset?: {
        _ref: string;
        _type: "reference";
        _weak?: boolean;
        ["internalGroqTypeReferenceTo"]?: "sanity.imageAsset";
      };
      hotspot?: SanityImageHotspot;
      crop?: SanityImageCrop;
      alt?: string;
      _type: "image";
      _key: string;
    }
>;

export type SiteInfoQueryRizzult = {
  socialMedia: {
    youtube?: string | null;
    github?: string | null;
    x?: string | null;
    instagram?: string | null;
    linkedIn?: string | null;
  };
  _id: "siteInfo";
  title: string;
  email: string;
  resume: string;
  description?: Block;
}[];

export type SanityPage = {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  body: Block;
};
