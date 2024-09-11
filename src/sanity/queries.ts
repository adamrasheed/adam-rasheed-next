import { defineQuery } from "next-sanity";

export const CASE_STUDIES_QUERY = defineQuery(`*[_type == "caseStudy"]{
  _id,
  title,
  subtitle,
  teaser,
  description[]{
    ...,
    _type == "image" => {
      "imageUrl": asset->url,
      alt
    }
  }
}
`);

export const POSTS_QUERY = defineQuery(`*[_type == "post"]{
  _id,
  title,
  slug,
  excerpt,
  mainImage,
  categories[]->{
    _id,
    title
  },
  publishedAt,
  body[]{
    ...,
    _type == "image" => {
      "imageUrl": asset->url,
      alt
    }
  }
}
`);

export const SITE_INFO_QUERY = defineQuery(`*[_type == "siteInfo"]{
  _id,
  title,
  email,
  resume,
  description[]{
    ...,
  },
  socialMedia
}`);
