#!/usr/bin/env bash
# Regenerate the subset Inter faces used by the blog OG card route
# (src/app/blog/[slug]/opengraph-image.tsx).
#
# Why this exists: the full Inter TTFs are ~320KB each. Bundled into an edge
# function alongside Satori and the Sanity client they push it to 1.1MB, over
# the 1MB plan limit. That failure happens at DEPLOY time, not build time, so
# `next build` passes locally and the deployment still fails. Subsetting to
# Latin-1 plus common punctuation gets each face to ~32KB.
#
# Run this if you need to widen the character range (a post title using a glyph
# outside the subset renders blank). Widen UNICODES below, do not swap the full
# font back in.
#
# Usage:  ./scripts/subset-og-fonts.sh
# Needs:  python3 with fonttools (pip install fonttools brotli)

set -euo pipefail

cd "$(dirname "$0")/.."
FONT_DIR="src/app/_fonts"

# Inter v20, Latin. These are the same faces Google Fonts serves.
REGULAR_URL="https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf"
BOLD_URL="https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf"

# ASCII, Latin-1 supplement, dashes, curly quotes, ellipsis, primes, euro, tm.
UNICODES="U+0020-007E,U+00A0-00FF,U+2010-2015,U+2018-201D,U+2026,U+2032-2033,U+20AC,U+2122"

if ! python3 -c "import fontTools" 2>/dev/null; then
  echo "fonttools not found. Install it, ideally in a venv:" >&2
  echo "  python3 -m venv /tmp/fontvenv && /tmp/fontvenv/bin/pip install fonttools brotli" >&2
  echo "  PATH=/tmp/fontvenv/bin:\$PATH ./scripts/subset-og-fonts.sh" >&2
  exit 1
fi

mkdir -p "$FONT_DIR"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

for pair in "Regular:$REGULAR_URL" "Bold:$BOLD_URL"; do
  weight="${pair%%:*}"
  url="${pair#*:}"

  curl -sfL "$url" -o "$tmp/Inter-$weight.full.ttf"

  pyftsubset "$tmp/Inter-$weight.full.ttf" \
    --output-file="$FONT_DIR/Inter-$weight.ttf" \
    --unicodes="$UNICODES" \
    --layout-features="kern,liga" \
    --no-hinting \
    --desubroutinize

  printf '%-16s %s\n' "Inter-$weight.ttf" "$(du -h "$FONT_DIR/Inter-$weight.ttf" | cut -f1)"
done

echo "Done. Inter is bundled under the SIL Open Font License."
