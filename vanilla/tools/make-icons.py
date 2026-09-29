#!/usr/bin/env python3
"""Generate the PWA icon set. Pure stdlib (zlib + struct), 4x4 supersampled.

Shapes are signed-distance fields so edges anti-alias without a rasteriser.
Run:  python3 tools/make-icons.py
"""
import math
import os
import struct
import zlib

INK = (0x12, 0x0F, 0x24)
LIME = (0xD4, 0xFF, 0x3F)
TEAL = (0x5E, 0xEA, 0xD4)
OUT = os.path.join(os.path.dirname(__file__), "..", "icons")


def write_png(path, w, h, px):
    """px: flat bytearray of RGBA rows."""
    raw = b"".join(b"\x00" + bytes(px[y * w * 4:(y + 1) * w * 4]) for y in range(h))

    def chunk(tag, data):
        c = struct.pack(">I", len(data)) + tag + data
        return c + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    png = (b"\x89PNG\r\n\x1a\n"
           + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0))
           + chunk(b"IDAT", zlib.compress(raw, 9))
           + chunk(b"IEND", b""))
    with open(path, "wb") as f:
        f.write(png)
    return len(png)


def sd_round_rect(px, py, cx, cy, hw, hh, r):
    qx, qy = abs(px - cx) - (hw - r), abs(py - cy) - (hh - r)
    return math.hypot(max(qx, 0), max(qy, 0)) + min(max(qx, qy), 0) - r


def sd_circle(px, py, cx, cy, r):
    return math.hypot(px - cx, py - cy) - r


def sd_ellipse(px, py, cx, cy, rx, ry):
    # scaled-space approximation, exact enough at these radii
    k = math.hypot((px - cx) / rx, (py - cy) / ry)
    return (k - 1) * min(rx, ry)


def sd_smile(px, py, cx, cy, r, thick):
    """Lower half of an annulus: the mouth."""
    d = abs(math.hypot(px - cx, py - cy) - r) - thick
    if py < cy:
        return 1e9  # nothing above the centre line
    return d


def render(size, bleed, corner_frac, content):
    """bleed: full-bleed square bg. corner_frac: corner radius as a fraction
    of size. content: fraction of the canvas the blob may occupy."""
    ss = 4
    buf = bytearray(size * size * 4)
    c = size / 2
    corner = corner_frac * size
    # blob geometry in device px
    br = size * content / 2
    eye_dx, eye_dy = br * 0.36, br * 0.26
    eye_r = br * 0.115
    smile_r, smile_t = br * 0.52, br * 0.085

    for y in range(size):
        for x in range(size):
            r = g = b = 0
            a = 0
            for sy in range(ss):
                for sx in range(ss):
                    px = x + (sx + 0.5) / ss
                    py = y + (sy + 0.5) / ss
                    # background
                    if bleed or corner_frac > 0:
                        d = sd_round_rect(px, py, c, c, c, c, corner)
                    else:
                        d = -1
                    inside_bg = d < 0
                    if not inside_bg:
                        continue
                    # blob
                    col = INK
                    if sd_circle(px, py, c, c, br) < 0:
                        if (sd_ellipse(px, py, c - eye_dx, c - eye_dy, eye_r, eye_r * 1.35) < 0
                                or sd_ellipse(px, py, c + eye_dx, c - eye_dy, eye_r, eye_r * 1.35) < 0
                                or sd_smile(px, py, c, c - br * 0.06, smile_r, smile_t) < 0):
                            col = INK
                        else:
                            col = LIME
                    r += col[0]; g += col[1]; b += col[2]; a += 255
            n = ss * ss
            if a == 0:
                continue
            # un-premultiply the partial-coverage alpha back out
            cov = a / 255
            i = (y * size + x) * 4
            buf[i] = int(r / cov); buf[i + 1] = int(g / cov)
            buf[i + 2] = int(b / cov); buf[i + 3] = int(255 * a / (255 * n))
    return buf


def main():
    os.makedirs(OUT, exist_ok=True)
    jobs = [
        # name,                 size, bleed, corner, content
        ("favicon-32.png",         32, False, 0.30, 0.82),
        ("favicon-96.png",         96, False, 0.24, 0.80),
        ("icon-192.png",          192, False, 0.22, 0.76),
        ("icon-512.png",          512, False, 0.22, 0.76),
        # maskable: full-bleed, content inside the 80% safe zone
        ("icon-192-maskable.png", 192, True,  0,    0.60),
        ("icon-512-maskable.png", 512, True,  0,    0.60),
        # iOS masks the icon itself and dislikes transparency
        ("apple-touch-icon.png",  180, True,  0,    0.70),
    ]
    for name, size, bleed, corner, content in jobs:
        px = render(size, bleed, corner, content)
        n = write_png(os.path.join(OUT, name), size, size, px)
        print(f"  {name:26} {size}x{size}  {n:,} bytes")
    print(f"icons written to {os.path.abspath(OUT)}")


if __name__ == "__main__":
    main()
