#!/usr/bin/env python3
"""Generate the Eciperay brand asset set (#861) from the DS-owned mark.

The artwork source of truth is src/icons/BrandMark.tsx (the Eciperay
"Ecipe-ray" paths + Warm Harvest colors Stephen approved in PR #887).
This script parses those constants out of the component so the exported
assets can never drift from the rendered mark, then writes:

  assets/brand/eciperay/eciperay-mark.svg          mark (with its paper field)
  assets/brand/eciperay/favicon.svg                 favicon (SVG)
  assets/brand/eciperay/favicon.ico                 16/32/48 multi-size
  assets/brand/eciperay/favicon-16.png / -32 / -48  favicon PNGs
  assets/brand/eciperay/apple-touch-icon-180.png
  assets/brand/eciperay/icon-192.png / icon-512.png (PWA)
  assets/brand/eciperay/app-icon.svg                mark on Warm Harvest paper
  assets/brand/eciperay/app-icon-1024.png           app / store icon
  assets/brand/eciperay/lockup-horizontal.svg/.png  mark + wordmark right
  assets/brand/eciperay/lockup-stacked.svg/.png     mark + wordmark below

Unlike the Memorize mark, the Ecipe-ray composition carries its own
warm-paper field (the rounded rect in BrandMark.tsx), so the mark SVG
includes it and the PWA icons are the full composition, not a
transparent glyph. Wordmark: "Eciperay" in Raleway SemiBold (the DS
UI font), ink #292019 on transparency.

Requires: cairosvg + Pillow (pip install cairosvg pillow) and the
Raleway font installed for the lockup PNG renders.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "assets" / "brand" / "eciperay"
SRC = (ROOT / "src" / "icons" / "BrandMark.tsx").read_text()

def const_str(name: str) -> str:
    m = re.search(rf'const {name} =\s*\n?\s*"([^"]+)"', SRC)
    if not m:
        sys.exit(f"constant {name} not found in BrandMark.tsx")
    return m.group(1)

def const_num(name: str) -> str:
    m = re.search(rf'const {name} = "?(#[0-9a-fA-F]+)"?', SRC)
    if not m:
        sys.exit(f"constant {name} not found in BrandMark.tsx")
    return m.group(1)

PAPER = const_num("ECIPERAY_MARK_PAPER")
SUN = const_num("ECIPERAY_MARK_SUN")
CARD = const_num("ECIPERAY_MARK_CARD")
RAYS = const_str("ECIPERAY_RAYS_PATH")
CARD_E = const_str("ECIPERAY_CARD_E_PATH")
HOLES = re.search(r"const ECIPERAY_CARD_HOLE_CYS = \[([^\]]+)\]", SRC)
if not HOLES:
    sys.exit("ECIPERAY_CARD_HOLE_CYS not found in BrandMark.tsx")
HOLE_CYS = [h.strip() for h in HOLES.group(1).split(",")]
INK = "#292019"  # Warm Harvest text (src/themes/eciperay.ts)

def mark_group(transform: str = "") -> str:
    holes = "\n".join(
        f'  <circle cx="55.6" cy="{cy}" r="5.4" fill="{PAPER}"/>' for cy in HOLE_CYS
    )
    t = f' transform="{transform}"' if transform else ""
    return (
        f"<g{t}>\n"
        f'  <rect x="20" y="20" width="216" height="216" rx="48" fill="{PAPER}"/>\n'
        f'  <path d="{RAYS}" fill="{SUN}"/>\n'
        f'  <circle cx="128.1" cy="114.8" r="50.6" fill="{SUN}"/>\n'
        f'  <rect x="40.1" y="110.2" width="175.9" height="109.8" rx="11.2" fill="{CARD}"/>\n'
        f"{holes}\n"
        f'  <path d="{CARD_E}" fill="{PAPER}"/>\n'
        "</g>"
    )

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
    (OUT / "eciperay-mark.svg").write_text(mark_svg)
    (OUT / "favicon.svg").write_text(mark_svg)

    # App icon: mark at 76% centred on the Warm Harvest paper field
    # (the same paper the mark's own field uses, so it sits seamlessly).
    app_inner = (
        f'  <rect x="0" y="0" width="256" height="256" fill="{PAPER}"/>\n'
        + mark_group("translate(30.72 30.72) scale(0.76)")
    )
    (OUT / "app-icon.svg").write_text(svg_doc("0 0 256 256", app_inner))

    # Lockups: wordmark in Raleway SemiBold.
    horiz = (
        mark_group()
        + f'\n  <text x="284" y="168" font-family="Raleway, sans-serif"'
        + f' font-weight="600" font-size="92" fill="{INK}">Eciperay</text>'
    )
    (OUT / "lockup-horizontal.svg").write_text(svg_doc("0 0 760 256", horiz))
    stacked = (
        mark_group("translate(128 0)")
        + f'\n  <text x="256" y="348" text-anchor="middle"'
        + f' font-family="Raleway, sans-serif" font-weight="600"'
        + f' font-size="72" fill="{INK}">Eciperay</text>'
    )
    (OUT / "lockup-stacked.svg").write_text(svg_doc("0 0 512 384", stacked))

    sys.path.insert(0, str(Path(__file__).parent))
    import cairosvg
    from PIL import Image

    def png(svg_path: Path, out_path: Path, w: int, h: int | None = None):
        cairosvg.svg2png(url=str(svg_path), write_to=str(out_path),
                         output_width=w, output_height=h or w)

    png(OUT / "eciperay-mark.svg", OUT / "favicon-16.png", 16)
    png(OUT / "eciperay-mark.svg", OUT / "favicon-32.png", 32)
    png(OUT / "eciperay-mark.svg", OUT / "favicon-48.png", 48)
    png(OUT / "eciperay-mark.svg", OUT / "apple-touch-icon-180.png", 180)
    png(OUT / "eciperay-mark.svg", OUT / "icon-192.png", 192)
    png(OUT / "eciperay-mark.svg", OUT / "icon-512.png", 512)
    png(OUT / "app-icon.svg", OUT / "app-icon-1024.png", 1024)
    png(OUT / "lockup-horizontal.svg", OUT / "lockup-horizontal.png", 1520, 512)
    png(OUT / "lockup-stacked.svg", OUT / "lockup-stacked.png", 1024, 768)

    ico_src = Image.open(OUT / "favicon-48.png").convert("RGBA")
    ico_src.save(OUT / "favicon.ico", format="ICO",
                 sizes=[(16, 16), (32, 32), (48, 48)])
    print(f"wrote asset set to {OUT}")

if __name__ == "__main__":
    main()
