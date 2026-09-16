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

export const CASE_STUDIES_QUERY = defineQuery(`*[_type == "caseStudy"] | order(_createdAt desc){
  _id,
  title,
  subtitle,
  teaser,
  mainImage,
  description[]${DESCRIPTION_FIELD},
}
`);

export const CASE_STUDIES_PREVIEW_QUERY = defineQuery(
  `*[_type == "caseStudy"] | order(_createdAt desc)${CASE_STUDY_PREVIEW_FIELDS}`
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
  `*[_type == "post"] | order(publishedAt desc)${POST_PREVIEW_FIELDS}`
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
    
    "relatedPostsByCategory": *[_type == "post" && slug.current != $slug && references(*[_type == "post" && slug.current == $slug][0].categories[]._ref)] | order(publishedAt desc)[0...3]{
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
    },

    "author": *[_type == "siteInfo"][0]{
      title,
      email,
      authorBio,
      authorImage,
      socialMedia
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
  "caseStudies": *[_type == "caseStudy"] | order(_createdAt desc)${CASE_STUDY_PREVIEW_FIELDS}[0...2],
  "posts": *[_type == "post"] | order(publishedAt desc)${POST_PREVIEW_FIELDS}[0...2],
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
] | order(publishedAt desc){
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

// Availability is derived from the shelf: a drink is on the menu only when
// every ingredient it needs is in stock. `available` stays as an explicit 86
// override on top of that, and off always wins, so it is still how a drink gets
// pulled when the bottles are all there.
//
// This is computed in GROQ rather than in the page for two reasons. The order
// route has to enforce the same rule server-side before it writes an order, so
// the rule needs one definition both callers share or they drift. And the page
// has no use for per-bottle stock: filtering here means an unavailable drink
// never reaches the client, which is what "hidden entirely, not greyed out"
// requires.
//
// `optional != true` is what keeps a missing garnish from 86ing a whole drink.
// The `count(ingredients) > 0` guard hides a cocktail with an empty ingredient
// list: the schema should have rejected that document, and offering a drink
// nothing is known about is the wrong way to fail.
const COCKTAIL_IN_STOCK = `available != false
  && count(ingredients) > 0
  && count(ingredients[optional != true && ingredient->inStock != true]) == 0`;

export const COCKTAILS_QUERY = defineQuery(`*[
  _type == "cocktail" && ${COCKTAIL_IN_STOCK}
] | order(name asc){
  _id,
  name,
  description,
  "ingredients": ingredients[]{"name": coalesce(label, ingredient->name)}.name,
  category,
}`);

// The whole live state of the bar in one round trip: the open/closed switch plus
// every order in flight, oldest first. Deliberately omits guestId, because this
// response is shared by every guest, and guestId is what authorizes a cancel.
export const BAR_STATE_QUERY = defineQuery(`{
  "open": coalesce(*[_type == "barSession"][0].open, false),
  "orders": *[_type == "order"] | order(placedAt asc){
    _id,
    guestName,
    notes,
    status,
    placedAt,
    "cocktailId": cocktail._ref,
    "cocktailName": cocktail->name
  }
}`);

export const BAR_OPEN_QUERY = defineQuery(
  `coalesce(*[_type == "barSession"][0].open, false)`
);

// Serves both the "you already have a drink coming" pre-check (looked up by the
// guest's derived document id) and the ownership check on cancel.
export const ORDER_BY_ID_QUERY = defineQuery(`*[
  _type == "order" && _id == $orderId
][0]{
  _id,
  guestId,
  status,
  "cocktailName": cocktail->name
}`);

// Same availability rule as the menu, re-checked at order time: a bottle can
// run out between the page render and the tap.
export const ORDERABLE_COCKTAIL_QUERY = defineQuery(`*[
  _type == "cocktail" && _id == $cocktailId && ${COCKTAIL_IN_STOCK}
][0]{
  _id,
  name
}`);

export const ORDER_COUNT_QUERY = defineQuery(`count(*[_type == "order"])`);
