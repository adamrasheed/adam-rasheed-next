import { type SchemaTypeDefinition } from "sanity";

import { blockContentType } from "./blockContentType";
import { categoryType } from "./categoryType";
import { postType } from "./postType";
import caseStudyType from "./caseStudyType";
import { siteInfo } from "./siteInfoType";
import { pageType } from "./pageType";
import { aboutType } from "./aboutType";
import { contributionType } from "./aboutContributionType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    blockContentType,
    categoryType,
    aboutType,
    contributionType,
    postType,
    pageType,
    caseStudyType,
    siteInfo,
  ],
};
