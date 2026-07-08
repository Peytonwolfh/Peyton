"""Generate PWA icons from the TidySheetStudioFinds shop logo.

Produces the icon sizes required for an installable PWA plus Apple touch icon
and favicon. Maskable variants are composited onto a solid sage background so
there is never any transparency in the safe zone.
"""
from PIL import Image
import os

SRC = "/home/user/Peyton/products/shop_branding/logo.png"
OUT = "/home/user/Peyton/app/petsitter/public"
SAGE = (92, 122, 94)  # #5C7A5E brand sage

os.makedirs(OUT, exist_ok=True)
logo = Image.open(SRC).convert("RGBA")


def resized(size):
    return logo.resize((size, size), Image.LANCZOS)


def maskable(size, scale=0.82):
    """Solid sage canvas with the logo centered within the ~80% safe zone."""
    canvas = Image.new("RGBA", (size, size), SAGE + (255,))
    inner = int(size * scale)
    art = logo.resize((inner, inner), Image.LANCZOS)
    off = (size - inner) // 2
    canvas.paste(art, (off, off), art)
    return canvas.convert("RGB")


# Standard "any" icons (logo already has a full sage background, keep as-is)
resized(192).convert("RGB").save(os.path.join(OUT, "icon-192.png"))
resized(512).convert("RGB").save(os.path.join(OUT, "icon-512.png"))

# Maskable icons (safe-zone padded)
maskable(192).save(os.path.join(OUT, "icon-192-maskable.png"))
maskable(512).save(os.path.join(OUT, "icon-512-maskable.png"))

# Apple touch icon (iOS Add to Home Screen)
resized(180).convert("RGB").save(os.path.join(OUT, "apple-touch-icon.png"))

# Favicon
resized(32).convert("RGB").save(os.path.join(OUT, "favicon.png"))
logo.resize((48, 48), Image.LANCZOS).convert("RGB").save(
    os.path.join(OUT, "favicon.ico"), format="ICO", sizes=[(48, 48), (32, 32), (16, 16)]
)

print("Generated icons:")
for f in sorted(os.listdir(OUT)):
    p = os.path.join(OUT, f)
    im = Image.open(p)
    print(f"  {f:28s} {im.size[0]}x{im.size[1]} {im.mode}")
