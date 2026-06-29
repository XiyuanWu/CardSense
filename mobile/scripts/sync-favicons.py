"""Sync purple card favicons to mobile/public and web/public (same icon on both tabs)."""
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parent
ASSETS = ROOT / "assets" / "images"
TARGETS = [ROOT / "public", REPO / "web" / "public"]

SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <path d="M170 28L174 36L182 40L174 44L170 52L166 44L158 40L166 36L170 28Z" fill="#5E17EB"/>
  <rect x="24" y="58" width="132" height="96" rx="14" stroke="#5E17EB" stroke-width="10"/>
  <rect x="24" y="82" width="132" height="22" fill="#5E17EB"/>
  <rect x="36" y="118" width="46" height="18" rx="5" stroke="#5E17EB" stroke-width="6"/>
</svg>"""

PURPLE = (0x5E, 0x17, 0xEB, 255)
STAR = [(170, 28), (174, 36), (182, 40), (174, 44), (170, 52), (166, 44), (158, 40), (166, 36)]


def render_icon(size: int) -> Image.Image:
    """Rasterize the CardSense mark (matches favicon.svg / CardIcon)."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    scale = size / 200.0

    def pt(x: float, y: float) -> tuple[float, float]:
        return (x * scale, y * scale)

    draw.polygon([pt(x, y) for x, y in STAR], fill=PURPLE)

    draw.rounded_rectangle(
        [pt(24, 58), pt(24 + 132, 58 + 96)],
        radius=14 * scale,
        outline=PURPLE,
        width=max(1, round(10 * scale)),
    )
    draw.rectangle([pt(24, 82), pt(24 + 132, 82 + 22)], fill=PURPLE)
    draw.rounded_rectangle(
        [pt(36, 118), pt(36 + 46, 118 + 18)],
        radius=5 * scale,
        outline=PURPLE,
        width=max(1, round(6 * scale)),
    )
    return img


def write_favicons(target_dir: Path) -> None:
    target_dir.mkdir(parents=True, exist_ok=True)
    (target_dir / "favicon.svg").write_text(SVG, encoding="utf-8")

    icon_32 = render_icon(32)
    icon_192 = render_icon(192)
    icon_512 = render_icon(512)

    icon_32.save(target_dir / "favicon.png")
    icon_192.save(target_dir / "logo192.png")
    icon_512.save(target_dir / "logo512.png")

    icon_32.save(
        target_dir / "favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
    )


def main() -> None:
    (ASSETS / "favicon.svg").write_text(SVG, encoding="utf-8")
    render_icon(192).save(ASSETS / "favicon.png")
    render_icon(32).save(ASSETS / "favicon.ico", format="ICO", sizes=[(16, 16), (32, 32)])

    for target in TARGETS:
        write_favicons(target)
        print("Synced", target)


if __name__ == "__main__":
    main()
