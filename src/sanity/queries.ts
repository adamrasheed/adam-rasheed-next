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

export const CASE_STUDIES_PREVIEW_QUERY = defineQuery(`*[_type == "caseStudy"]{
  _id,
  title,
  subtitle,
  teaser,
}
`);

export const POSTS_QUERY = defineQuery(`*[_type == "post"]{
  _id,
  title,
  slug,
  excerpt,
  mainImage,
  publishedAt,
}
`);

export const POSTS_PREVIEWS_QUERY = defineQuery(`*[_type == "post"]{
  _id,
  title,
  slug,
  excerpt,
  publishedAt,
}
`);

export const SINGLE_POST_QUERY = defineQuery(`
  {
    // Fetch the single post by its slug
    "post": *[_type == "post" && slug.current == $slug][0]{
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
    },
    
    // Fetch up to 3 related posts based on categories
    "relatedPostsByCategory": *[_type == "post" && slug.current != $slug && count(*[_type == 'post' && slug.current == $slug].categories) > 0 && categories[]->_id in *[_type == 'post' && slug.current == $slug][0].categories[]->_id] | order(publishedAt desc)[0...3]{
      _id,
      title,
      slug,
      mainImage,
      excerpt,
      categories[]->{
        _id,
        title
      },
      publishedAt
    },
    
    // Fetch fallback posts if there are less than 3 related posts
    "fallbackPosts": *[_type == "post" && slug.current != $slug && !(_id in path('drafts.**'))] | order(publishedAt desc)[0...3]{
      _id,
      title,
      slug,
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

export const HOME_QUERY = defineQuery(`{
  "siteInfo": *[_type == "siteInfo"]{
    _id,
    title,
    email,
    resume,
    description[]{
      ...,
    },
    socialMedia
  },
  "caseStudies": *[_type == "caseStudy"]{
    _id,
    title,
    subtitle,
    teaser,
  }[0...2],
  "posts": *[_type == "post"]{
    _id,
    title,
    slug,
    excerpt,
    publishedAt,
  }[0...2]
}`);
