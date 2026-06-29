"""Generate Expo app icon assets from CardSense logo."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets" / "images" / "CardSense logo.png"
OUT = ROOT / "assets" / "images"


def pad_square(img: Image.Image, size: int, bg=(255, 255, 255)) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), bg + (255,))
    scale = min(size * 0.82 / img.width, size * 0.82 / img.height)
    w, h = int(img.width * scale), int(img.height * scale)
    resized = img.resize((w, h), Image.Resampling.LANCZOS)
    x = (size - w) // 2
    y = (size - h) // 2
    canvas.paste(resized, (x, y), resized if resized.mode == "RGBA" else None)
    return canvas


def main() -> None:
    logo = Image.open(SRC).convert("RGBA")
    pad_square(logo, 1024).save(OUT / "icon.png")
    pad_square(logo, 512).save(OUT / "splash-icon.png")
    pad_square(logo, 192).save(OUT / "favicon.png")
    pad_square(logo, 432).save(OUT / "android-icon-foreground.png")
    Image.new("RGBA", (432, 432), (255, 255, 255, 255)).save(
        OUT / "android-icon-background.png"
    )
    mono = pad_square(logo.convert("L").convert("RGBA"), 432)
    mono.save(OUT / "android-icon-monochrome.png")
    print("Generated app icons in", OUT)


if __name__ == "__main__":
    main()
