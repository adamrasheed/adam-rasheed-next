import { type SchemaTypeDefinition } from "sanity";

import { blockContentType } from "./blockContentType";
import { categoryType } from "./categoryType";
import { postType } from "./postType";
import caseStudyType from "./caseStudyType";
import { siteInfo } from "./siteInfoType";
import { pageType } from "./pageType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    blockContentType,
    categoryType,
    postType,
    pageType,
    caseStudyType,
    siteInfo,
  ],
};
