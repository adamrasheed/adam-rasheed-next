import { ImageResponse } from "next/og";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { SITE_NAME } from "@/constants";

// Required for the font fetch below: on the Node runtime `new URL(..., import
// .meta.url)` resolves to a relative /_next/static path that fetch cannot parse.
export const runtime = "edge";

export const alt = "Adam Rasheed";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// A dedicated read-only client rather than @/sanity/lib/client, which pulls in
// server-only, next/headers, and a token check this route does not need.
const ogClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});

// Matches the site's dark theme in src/styles/globals.css.
const BACKGROUND = "#0f172a";
const PRIMARY = "#e2e8f0";
const MUTED = "#7c8ba1";

const ROLE = "Frontend Software Engineer";

// Narrower than SINGLE_POST_QUERY on purpose: this route renders a card, so
// pulling the body and related posts would be waste. Declared inline rather
// than in queries.ts to keep this change off that file.
const OG_POST_QUERY = `*[_type == "post" && slug.current == $slug][0]{
  title,
  "category": categories[0]->title
}`;

// Keeps long titles on the card without shrinking short ones.
function titleSize(title: string) {
  if (title.length > 95) return 54;
  if (title.length > 70) return 62;
  if (title.length > 45) return 72;
  return 84;
}

export default async function OpengraphImage({
  params: { slug },
}: {
  params: { slug: string };
}) {
  // These TTFs are subset to Latin-1 plus common punctuation (~32KB each,
  // down from ~320KB). The full faces pushed this edge function to 1.1MB,
  // over the 1MB plan limit, which fails at deploy time rather than at build.
  // A title using a glyph outside that range will render blank, so widen the
  // subset in scripts/ rather than swapping in the full font.
  // A 404 here still resolves, and arrayBuffer() would hand Satori an HTML
  // error page, which fails much later with an unrelated-looking message.
  // The URLs must stay static literals: webpack traces the .ttf into the bundle
  // by statically analyzing new URL(..., import.meta.url), and a template
  // literal defeats that and leaves the font unresolvable at runtime.
  const loadFont = async (url: URL, name: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OG font ${name} failed to load (${res.status})`);
    return res.arrayBuffer();
  };

  const [regular, bold] = await Promise.all([
    loadFont(
      new URL("../../_fonts/Inter-Regular.ttf", import.meta.url),
      "Inter-Regular.ttf",
    ),
    loadFont(new URL("../../_fonts/Inter-Bold.ttf", import.meta.url), "Inter-Bold.ttf"),
  ]);

  let title = SITE_NAME;
  let category = "Blog";

  // A card with fallback text still beats no card, so a Sanity outage must not
  // fail the image route.
  try {
    const post = await ogClient.fetch<{
      title?: string;
      category?: string;
    } | null>(OG_POST_QUERY, { slug });

    if (post?.title) title = post.title;
    if (post?.category) category = post.category;
  } catch {
    // fall through to the defaults
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: BACKGROUND,
          padding: 80,
          fontFamily: "Inter",
        }}
      >
        {/* The site wordmark: bold name, 1px rule, small-caps role. */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: PRIMARY }}>
            {SITE_NAME}
          </div>
          <div
            style={{
              display: "flex",
              width: 1,
              height: 22,
              backgroundColor: MUTED,
              margin: "0 14px",
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 18,
              fontWeight: 400,
              color: MUTED,
              letterSpacing: "0.1em",
            }}
          >
            {ROLE.toUpperCase()}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: titleSize(title),
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            color: PRIMARY,
            paddingRight: 40,
          }}
        >
          {title}
        </div>

        {/* The .accent::after motif: small-caps label trailed by a 32x2 bar. */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              fontWeight: 700,
              color: MUTED,
              letterSpacing: "0.12em",
            }}
          >
            {category.toUpperCase()}
          </div>
          <div
            style={{
              display: "flex",
              width: 32,
              height: 2,
              backgroundColor: MUTED,
              marginLeft: 12,
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter", data: regular, weight: 400, style: "normal" },
        { name: "Inter", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
