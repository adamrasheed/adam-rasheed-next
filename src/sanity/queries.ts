import { defineQuery } from "next-sanity";

export const DESCRIPTION_FIELD = `{
  ...,
  _type == "image" => {
    "imageUrl": asset->url,
    alt
  }
}`;

export const CASE_STUDY_PREVIEW_FIELDS = `{
  _id,
  title,
  subtitle,
  teaser,
  slug,
  mainImage {
    ...,
    metadata
  }
}`;

export const CASE_STUDIES_QUERY = defineQuery(`*[_type == "caseStudy"]{
  _id,
  title,
  subtitle,
  teaser,
  mainImage,
  description[]${DESCRIPTION_FIELD},
}
`);

export const CASE_STUDIES_PREVIEW_QUERY = defineQuery(
  `*[_type == "caseStudy"]${CASE_STUDY_PREVIEW_FIELDS}`
);

export const CASE_STUDY_BY_SLUG_QUERY =
  defineQuery(`*[_type == "caseStudy" && slug.current == $slug][0]{
  _id,
  title,
  subtitle,
  teaser,
  slug,
  mainImage {
    ...,
    metadata
  },
  description[]${DESCRIPTION_FIELD},
}`);

const POST_PREVIEW_FIELDS = `{
  _id,
  title,
  slug,
  excerpt,
  categories[]->{
    _id,
    title,
    slug
  },
  publishedAt,
}`;

export const POSTS_PREVIEWS_QUERY = defineQuery(
  `*[_type == "post"]${POST_PREVIEW_FIELDS}`
);

export const SINGLE_POST_QUERY = defineQuery(`
  {
    "post": *[_type == "post" && slug.current == $slug][0]{
      _id,
      title,
      slug,
      excerpt,
      mainImage {
        asset->{
          url,
          metadata
        },
        alt
      },
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
    },
    
    "relatedPostsByCategory": *[_type == "post" && slug.current != $slug && defined(categories) && categories[]->_id in *[_type == "post" && slug.current == $slug][0].categories[]->_id] | order(publishedAt desc)[0...3]{
      _id,
      title,
      slug,
      excerpt,
      publishedAt
    },
    
    "fallbackPosts": *[_type == "post" && slug.current != $slug] | order(publishedAt desc)[0...3]{
      _id,
      title,
      slug,
      excerpt,
      publishedAt
    }
  }
`);

export const PAGE_QUERY = defineQuery(`
  *[_type == "page" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    body[]{
      ...,
      _type == "image" => {
        "imageUrl": asset->url,
        alt
      }
    }
  }
`);

export const SITE_INFO_FIELDS = `{
  _id,
  title,
  email,
  resume,
  description[]{
    ...,
  },
  socialMedia
}`;

export const SITE_INFO_QUERY_FIELDS = `*[_type == "siteInfo"][0]${SITE_INFO_FIELDS}`;

export const SITE_INFO_QUERY = defineQuery(SITE_INFO_QUERY_FIELDS);

export const HOME_QUERY = defineQuery(`{
  "siteInfo": ${SITE_INFO_QUERY_FIELDS},
  "caseStudies": *[_type == "caseStudy"]${CASE_STUDY_PREVIEW_FIELDS}[0...2],
  "posts": *[_type == "post"]${POST_PREVIEW_FIELDS}[0...2],
}`);

export const ABOUT_QUERY = defineQuery(`*[_type == "about"][0]{
  _id,
  _createdAt,
  _updatedAt,
  bio[]{
    ...,
    _type == "image" => {
      "imageUrl": asset->url,
      alt
    }
  },
  contributions[]{
    _key,
    title,
    contributions[]{
      _key,
      title,
      date,
      description,
      link
    }
  },
  mainImage {
    ...,
    metadata
  },
}`);

export const CATEGORIES_QUERY = defineQuery(`*[_type == "category"]{
  _id,
  title,
  "slug": slug.current
}
`);

export const POSTS_PREVIEW_BY_SLUG_QUERY = defineQuery(`*[
  _type == "post" && 
  ($categorySlug == null || $categorySlug in categories[]->slug.current)
]{
  _id,
  title,
  slug,
  excerpt,
  mainImage,
  categories[]->{
    _id,
    title,
    "slug": slug.current
  },
  publishedAt,
}`);
