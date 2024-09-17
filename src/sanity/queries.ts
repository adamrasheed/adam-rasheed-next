import { defineQuery } from "next-sanity";

export const CASE_STUDIES_QUERY = defineQuery(`*[_type == "caseStudy"]{
  _id,
  title,
  subtitle,
  teaser,
  mainImage,
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

export const SITE_INFO_QUERY = defineQuery(`*[_type == "siteInfo"][0]{
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
  "siteInfo": *[_type == "siteInfo"][0]{
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
    slug,
    mainImage {
      ...,
      metadata
    },
    subtitle,
    teaser,
  }[0...2],
  "posts": *[_type == "post"]{
    _id,
    title,
    slug,
    mainImage {
      ...,
      metadata
    },
    excerpt,
    publishedAt,
  }[0...2]
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
