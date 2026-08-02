#!/usr/bin/env node
// import-post.mjs — turn an approved markdown draft into an UNPUBLISHED `post`
// draft in Sanity Studio. Never publishes.
//
// Companion to the case-study importer in ~/.claude/skills/case-study/scripts,
// which does the same job for the `caseStudy` type.
//
// Usage:
//   node scripts/import-post.mjs --file path/to/draft.md --category Shopify
// Options:
//   --published-at <iso>  publishedAt value (default: now)
//   --dry-run             print the document that would be written, write nothing
//
// The markdown must use only what src/sanity/schemaTypes/blockContentType.ts
// can represent: h2/h3/h4, blockquote, bulleted lists, bold, italic, and links.
// Anything else (code fences, ordered lists, images, tables) is a hard error
// rather than a silent drop, so a post never lands in Studio missing content.

import { createClient } from "@sanity/client";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--")) {
    return process.argv[i + 1];
  }
  return fallback;
}
const has = (name) => process.argv.includes(`--${name}`);
const die = (msg) => {
  console.error(`import-post: ${msg}`);
  process.exit(1);
};

function loadEnv(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let [, k, v] = m;
    v = v.replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}

// Keys only need to be unique within the document, and a counter keeps repeat
// runs byte-identical so re-importing does not churn the document.
let keySeq = 0;
const key = () => `k${(keySeq++).toString(36)}`;

// --- frontmatter -----------------------------------------------------------

function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) die("no YAML frontmatter block found at the top of the file");
  const meta = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([A-Za-z][A-Za-z0-9_]*):\s*(.*)$/);
    if (!kv) continue;
    meta[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, "");
  }
  return { meta, body: m[2] };
}

// --- inline marks ----------------------------------------------------------

// Splits a line into spans. Handles [text](url), **bold**, *italic*, scanning
// for whichever token appears first so nesting order does not matter.
function inlineSpans(text, markDefs) {
  const spans = [];

  const push = (t, marks) => {
    if (!t) return;
    spans.push({ _type: "span", _key: key(), text: t, marks });
  };

  let rest = text;
  while (rest.length) {
    const link = rest.match(/\[([^\]]+)\]\(([^)\s]+)\)/);
    const bold = rest.match(/\*\*([^*]+)\*\*/);
    const em = rest.match(/(^|[^*])\*([^*]+)\*/);

    const candidates = [
      link && { kind: "link", at: link.index, m: link },
      bold && { kind: "bold", at: bold.index, m: bold },
      em && { kind: "em", at: em.index + em.m?.[1]?.length ?? 0, m: em },
    ].filter(Boolean);

    if (!candidates.length) {
      push(rest, []);
      break;
    }

    const next = candidates.sort((a, b) => a.at - b.at)[0];

    if (next.kind === "link") {
      const m = next.m;
      push(rest.slice(0, m.index), []);
      const defKey = key();
      markDefs.push({ _key: defKey, _type: "link", href: m[2] });
      push(m[1], [defKey]);
      rest = rest.slice(m.index + m[0].length);
    } else if (next.kind === "bold") {
      const m = next.m;
      push(rest.slice(0, m.index), []);
      push(m[1], ["strong"]);
      rest = rest.slice(m.index + m[0].length);
    } else {
      const m = next.m;
      const lead = m[1] ?? "";
      const start = m.index + lead.length;
      push(rest.slice(0, start), []);
      push(m[2], ["em"]);
      rest = rest.slice(start + m[0].length - lead.length);
    }
  }

  return spans;
}

function block(style, text, extra = {}) {
  const markDefs = [];
  const children = inlineSpans(text, markDefs);
  return { _type: "block", _key: key(), style, markDefs, children, ...extra };
}

// --- markdown -> portable text --------------------------------------------

function toPortableText(md) {
  const blocks = [];
  const lines = md.split("\n");
  let paragraph = [];

  const flush = () => {
    if (!paragraph.length) return;
    blocks.push(block("normal", paragraph.join(" ").trim()));
    paragraph = [];
  };

  lines.forEach((rawLine, i) => {
    const line = rawLine.trimEnd();
    const at = `line ${i + 1}`;

    if (/^```/.test(line)) die(`code fence at ${at}; the schema has no code block type`);
    if (/^\s*\d+\.\s/.test(line)) die(`ordered list at ${at}; the schema only supports bullets`);
    if (/^!\[/.test(line)) die(`image at ${at}; blog post bodies must be text only`);
    if (/^\|/.test(line)) die(`table at ${at}; the schema has no table type`);
    if (/^(---|\*\*\*|___)\s*$/.test(line)) die(`horizontal rule at ${at}; unsupported`);
    if (/^#\s/.test(line)) die(`h1 at ${at}; the page renders the title as the h1, use h2`);

    if (!line.trim()) return flush();

    const heading = line.match(/^(#{2,4})\s+(.*)$/);
    if (heading) {
      flush();
      blocks.push(block(`h${heading[1].length}`, heading[2]));
      return;
    }

    if (/^>\s?/.test(line)) {
      flush();
      blocks.push(block("blockquote", line.replace(/^>\s?/, "")));
      return;
    }

    const bullet = line.match(/^[-*]\s+(.*)$/);
    if (bullet) {
      flush();
      blocks.push(block("normal", bullet[1], { listItem: "bullet", level: 1 }));
      return;
    }

    paragraph.push(line.trim());
  });

  flush();
  return blocks;
}

// --- sanity ----------------------------------------------------------------

async function preflight(projectId, token, envPath) {
  if (!projectId) die(`NEXT_PUBLIC_SANITY_PROJECT_ID not found in ${envPath}`);
  if (!token) {
    die(
      `no write token. Add SANITY_API_WRITE_TOKEN (Editor scope, from sanity.io/manage → API → Tokens) to ${envPath}. ` +
        `Note: SANITY_CREATE_TOKEN is a Sanity *Create* app token and CANNOT write to the dataset.`,
    );
  }
  let res;
  try {
    res = await fetch(`https://${projectId}.api.sanity.io/v2021-06-07/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (e) {
    die(`could not reach Sanity to validate the token (${e.message}).`);
  }
  if (res.status === 401) {
    die(
      `token rejected (401 "Session not found"). Create an Editor-scoped token at ` +
        `sanity.io/manage → API → Tokens and set SANITY_API_WRITE_TOKEN in ${envPath}.`,
    );
  }
  const me = await res.json().catch(() => ({}));
  const roles = (me.roles || []).map((r) => r.name);
  if (!roles.some((r) => ["administrator", "editor", "developer", "deploy-studio"].includes(r))) {
    die(
      `token is read-only (roles: ${roles.join(",") || "none"}). ` +
        `Provide an Editor-scoped token as SANITY_API_WRITE_TOKEN in ${envPath}.`,
    );
  }
  return me;
}

async function main() {
  const file = arg("file");
  if (!file) die("--file is required");
  const path = resolve(file);
  if (!existsSync(path)) die(`no such file: ${path}`);

  const dryRun = has("dry-run");
  const categoryTitle = arg("category");

  const { meta, body } = parseFrontmatter(readFileSync(path, "utf8"));
  for (const required of ["title", "slug", "excerpt"]) {
    if (!meta[required]) die(`frontmatter is missing "${required}"`);
  }

  // Everything from the review sections down is notes for a human, not content.
  const content = body.split(/^## (?:ALTERNATE TITLES|SELF-CRITIQUE)\s*$/m)[0];
  const blocks = toPortableText(content);
  if (!blocks.length) die("no body content found above the review sections");

  const envPath = resolve(REPO, ".env");
  loadEnv(envPath);
  loadEnv(resolve(REPO, ".env.local"));

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const token =
    process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_WRITE_TOKEN || "";

  const doc = {
    _id: `drafts.post-${meta.slug}`,
    _type: "post",
    title: meta.title,
    slug: { _type: "slug", current: meta.slug },
    excerpt: meta.excerpt,
    publishedAt: arg("published-at", new Date().toISOString()),
    body: blocks,
  };

  if (dryRun) {
    // Resolving the category needs a live client, so a dry run reports the
    // title it would look up rather than pretending it verified the reference.
    if (categoryTitle) doc.categories = [`<reference to category "${categoryTitle}">`];
    console.log(JSON.stringify(doc, null, 2));
    console.error(
      `\nimport-post: dry run. ${blocks.length} blocks, ` +
        `${blocks.filter((b) => b.style !== "normal").length} headings/quotes, ` +
        `${blocks.filter((b) => b.listItem).length} list items. Nothing written.`,
    );
    return;
  }

  await preflight(projectId, token, envPath);
  const client = createClient({ projectId, dataset, apiVersion: "2024-09-05", token, useCdn: false });

  if (categoryTitle) {
    const cat = await client.fetch(`*[_type == "category" && title == $t][0]{_id}`, {
      t: categoryTitle,
    });
    if (!cat?._id) {
      const known = await client.fetch(`*[_type == "category"].title`);
      die(`no category titled "${categoryTitle}". Existing: ${known.join(", ")}`);
    }
    doc.categories = [{ _type: "reference", _key: key(), _ref: cat._id }];
  }

  await client.createOrReplace(doc);

  console.log(`import-post: wrote ${doc._id} (${blocks.length} blocks) as an UNPUBLISHED draft.`);
  console.log(`Review and publish at /studio, or locally: http://localhost:3300/studio`);
}

main().catch((e) => die(e.message));
