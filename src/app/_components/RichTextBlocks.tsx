import clsx from "clsx";
import SanityImage from "./SanityImage";
import { SanityMainImage } from "../_types";

type Photo = SanityMainImage & { _key?: string; caption?: string };

// Sanity encodes the original size in the asset id: image-<hash>-1200x800-jpg.
function aspectRatio(photo: Photo) {
  const match = photo.asset?._ref?.match(/-(\d+)x(\d+)-/);
  return match ? Number(match[1]) / Number(match[2]) : 1;
}

export const Figure = ({
  value,
  className,
}: {
  value: Photo;
  className?: string;
}) => (
  <figure>
    <SanityImage img={value} className={className} />
    {value.caption && <figcaption>{value.caption}</figcaption>}
  </figure>
);

/**
 * Justified rows: every photo in a row gets a flex share equal to its aspect
 * ratio, so the row ends up one height and mixed orientations sit flush.
 */
export const Gallery = ({
  value,
}: {
  value: { images?: Photo[]; perRow?: number; caption?: string };
}) => {
  const images = value.images ?? [];
  const perRow = Math.max(1, value.perRow ?? 2);
  const rows: Photo[][] = [];
  for (let i = 0; i < images.length; i += perRow) {
    rows.push(images.slice(i, i + perRow));
  }

  return (
    <figure className="not-prose my-8 space-y-2">
      {rows.map((row, i) => (
        <div key={i} className="flex flex-col gap-2 sm:flex-row">
          {row.map((photo, j) => (
            <figure
              key={photo._key ?? j}
              style={{ flex: `${aspectRatio(photo)} 1 0%` }}
              className="min-w-0"
            >
              <SanityImage
                img={photo}
                sizes={`(min-width: 640px) ${Math.round(100 / row.length)}vw, 100vw`}
              />
              {photo.caption && <figcaption>{photo.caption}</figcaption>}
            </figure>
          ))}
        </div>
      ))}
      {value.caption && <figcaption>{value.caption}</figcaption>}
    </figure>
  );
};

export const CodeBlock = ({
  value,
}: {
  value: { code?: string; language?: string; filename?: string };
}) => (
  <figure>
    {value.filename && (
      <div className="text-xs font-mono text-slate-500 mb-1">{value.filename}</div>
    )}
    <pre className="mt-0">
      <code className={value.language ? `language-${value.language}` : undefined}>
        {value.code}
      </code>
    </pre>
  </figure>
);

export const Table = ({
  value,
}: {
  value: {
    rows?: { _key: string; cells?: string[] }[];
    hasHeader?: boolean;
    caption?: string;
  };
}) => {
  const rows = value.rows ?? [];
  const [head, ...body] = value.hasHeader ? rows : [undefined, ...rows];

  return (
    <div className="overflow-x-auto">
      <table>
        {value.caption && <caption>{value.caption}</caption>}
        {head && (
          <thead>
            <tr>
              {head.cells?.map((cell, i) => (
                <th key={i} scope="col">
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {body.map((row) => (
            <tr key={row?._key}>
              {row?.cells?.map((cell, i) => <td key={i}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

function embedSrc(raw: string) {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtu.be") return `https://www.youtube-nocookie.com/embed/${url.pathname.slice(1)}`;
  if (host.endsWith("youtube.com")) {
    const id =
      url.searchParams.get("v") ?? url.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/)?.[1];
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === "vimeo.com") {
    const id = url.pathname.match(/^\/(\d+)/)?.[1];
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }
  return null;
}

export const Embed = ({ value }: { value: { url?: string; caption?: string } }) => {
  const src = value.url ? embedSrc(value.url) : null;

  // An unsupported host still gets a working link instead of a blank box.
  if (!src) {
    return value.url ? (
      <p>
        <a href={value.url} target="_blank" rel="noopener noreferrer">
          {value.caption || value.url}
        </a>
      </p>
    ) : null;
  }

  return (
    <figure>
      <div className={clsx("relative", "aspect-video", "w-full")}>
        <iframe
          src={src}
          title={value.caption || "Embedded video"}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
      {value.caption && <figcaption>{value.caption}</figcaption>}
    </figure>
  );
};
