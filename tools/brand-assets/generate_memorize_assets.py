#!/usr/bin/env python3
"""Generate the Memorize brand asset set (#861) from the DS-owned mark.

The artwork source of truth is src/icons/BrandMark.tsx (the Memorize
paths + Quiet Dawn colors Stephen approved in PR #869). This script
parses those constants out of the component so the exported assets can
never drift from the rendered mark, then writes:

  assets/brand/memorize/memorize-mark.svg          mark on transparency
  assets/brand/memorize/favicon.svg                 favicon (SVG)
  assets/brand/memorize/favicon.ico                 16/32/48 multi-size
  assets/brand/memorize/favicon-16.png / -32 / -48  favicon PNGs
  assets/brand/memorize/apple-touch-icon-180.png
  assets/brand/memorize/icon-192.png / icon-512.png (PWA, transparent)
  assets/brand/memorize/app-icon.svg                mark on Quiet Dawn paper
  assets/brand/memorize/app-icon-1024.png           app / store icon
  assets/brand/memorize/lockup-horizontal.svg/.png  mark + wordmark right
  assets/brand/memorize/lockup-stacked.svg/.png     mark + wordmark below

Wordmark: "Memorize" in Raleway SemiBold (the DS UI font), ink #2b2620
on transparency; lockup PNGs render on the Quiet Dawn paper #faf8f2 is
NOT baked in — PNG lockups are transparent so hosts can place them.

Requires: cairosvg + Pillow (pip install cairosvg pillow) and the
Raleway font installed for the lockup PNG renders.
"""
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "assets" / "brand" / "memorize"
SRC = (ROOT / "src" / "icons" / "BrandMark.tsx").read_text()

def const_str(name: str) -> str:
    m = re.search(rf'const {name} =\s*\n?\s*"([^"]+)"', SRC)
    if not m:
        sys.exit(f"constant {name} not found in BrandMark.tsx")
    return m.group(1)

BOOK = const_str("MEMORIZE_MARK_BOOK")
ACCENT = const_str("MEMORIZE_MARK_ACCENT")
PAPER = "#faf8f2"   # Quiet Dawn background (src/themes/memorize.ts)
INK = "#2b2620"     # Quiet Dawn text

# Render order matches BrandMark.tsx exactly.
LAYERS = [
    ("MEMORIZE_RAYS_PATH", ACCENT),
    ("MEMORIZE_FLAME_PATH", ACCENT),
    ("MEMORIZE_BOOKMARK_PATH", ACCENT),
    ("MEMORIZE_COVER_LEFT_PATH", BOOK),
    ("MEMORIZE_COVER_RIGHT_PATH", BOOK),
    ("MEMORIZE_SPINE_PATH", BOOK),
    ("MEMORIZE_PAGES_PATH", BOOK),
]

def mark_group(transform: str = "") -> str:
    paths = "\n".join(
        f'  <path d="{const_str(name)}" fill="{fill}"/>' for name, fill in LAYERS
    )
    t = f' transform="{transform}"' if transform else ""
    return f"<g{t}>\n{paths}\n</g>"

def svg_doc(viewbox: str, inner: str, width=None, height=None) -> str:
    dims = ""
    if width:
        dims += f' width="{width}"'
    if height:
        dims += f' height="{height}"'
    return (
        '<svg xmlns="http://www.w3.org/2000/svg"'
        f' viewBox="{viewbox}"{dims}>\n{inner}\n</svg>\n'
    )

def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    mark_svg = svg_doc("0 0 256 256", mark_group())
    (OUT / "memorize-mark.svg").write_text(mark_svg)
    (OUT / "favicon.svg").write_text(mark_svg)

    # App icon: mark at 76% centred on the Quiet Dawn paper field.
    app_inner = (
        f'  <rect x="0" y="0" width="256" height="256" fill="{PAPER}"/>\n'
        + mark_group("translate(30.72 30.72) scale(0.76)")
    )
    (OUT / "app-icon.svg").write_text(svg_doc("0 0 256 256", app_inner))

    # Lockups: wordmark in Raleway SemiBold.
    # Horizontal: 256 mark + gap 28 + text at font-size 92, baseline 168.
    horiz = (
        mark_group()
        + f'\n  <text x="284" y="168" font-family="Raleway, sans-serif"'
        + f' font-weight="600" font-size="92" fill="{INK}">Memorize</text>'
    )
    (OUT / "lockup-horizontal.svg").write_text(svg_doc("0 0 760 256", horiz))
    # Stacked: mark centred over the wordmark (text centred at x=256).
    stacked = (
        mark_group("translate(128 0)")
        + f'\n  <text x="256" y="348" text-anchor="middle"'
        + f' font-family="Raleway, sans-serif" font-weight="600"'
        + f' font-size="72" fill="{INK}">Memorize</text>'
    )
    (OUT / "lockup-stacked.svg").write_text(svg_doc("0 0 512 384", stacked))

    # Rasterize.
    sys.path.insert(0, str(Path(__file__).parent))
    import cairosvg
    from PIL import Image
    import io

    def png(svg_path: Path, out_path: Path, w: int, h: int | None = None):
        cairosvg.svg2png(url=str(svg_path), write_to=str(out_path),
                         output_width=w, output_height=h or w)

    png(OUT / "memorize-mark.svg", OUT / "favicon-16.png", 16)
    png(OUT / "memorize-mark.svg", OUT / "favicon-32.png", 32)
    png(OUT / "memorize-mark.svg", OUT / "favicon-48.png", 48)
    png(OUT / "memorize-mark.svg", OUT / "apple-touch-icon-180.png", 180)
    png(OUT / "memorize-mark.svg", OUT / "icon-192.png", 192)
    png(OUT / "memorize-mark.svg", OUT / "icon-512.png", 512)
    png(OUT / "app-icon.svg", OUT / "app-icon-1024.png", 1024)
    png(OUT / "lockup-horizontal.svg", OUT / "lockup-horizontal.png", 1520, 512)
    png(OUT / "lockup-stacked.svg", OUT / "lockup-stacked.png", 1024, 768)

    ico_src = Image.open(OUT / "favicon-48.png").convert("RGBA")
    ico_src.save(OUT / "favicon.ico", format="ICO",
                 sizes=[(16, 16), (32, 32), (48, 48)])
    print(f"wrote asset set to {OUT}")

if __name__ == "__main__":
    main()
