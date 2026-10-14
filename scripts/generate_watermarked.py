#!/usr/bin/env python3
"""Generate the responsive, watermarked WebP renditions used by the site.

Requirements: Node.js and ImageMagick (`convert` and `identify`). Run from any
working directory; active frames and source dimensions come from js/data.js and
js/sizes.js. Original uploads are read only and never modified.
"""
from __future__ import annotations

import concurrent.futures
import json
import os
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "img" / "watermarked"
WATERMARKS = ROOT / "theapostrophe-logo-kit" / "watermarks"
WHITE = WATERMARKS / "watermark-logo-white-35pct.png"
BLACK = WATERMARKS / "watermark-logo-black-35pct.png"

DATA_READER = r"""
const vm = require('vm');
const fs = require('fs');
const context = { window: {} };
for (const file of ['js/data.js', 'js/sizes.js']) {
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), context);
}
process.stdout.write(JSON.stringify({
  files: context.window.SITE_DATA.imageSources,
  sizes: context.window.IMG_SIZES
}));
"""


def read_manifest() -> tuple[dict[str, str], dict[str, list[int]]]:
    result = subprocess.check_output(["node", "-e", DATA_READER], cwd=ROOT, text=True)
    manifest = json.loads(result)
    files, sizes = manifest["files"], manifest["sizes"]
    if set(files) != set(sizes):
        raise ValueError("js/data.js imageSources and js/sizes.js must have matching frame IDs")
    return files, sizes


def bottom_right_luminance(image: Path) -> float:
    result = subprocess.check_output(
        [
            "convert", str(image), "-auto-orient", "-gravity", "southeast",
            "-crop", "30%x25%+0+0", "+repage", "-colorspace", "Gray",
            "-format", "%[fx:mean]", "info:",
        ],
        cwd=ROOT,
        text=True,
    )
    return float(result.strip())


def make_frame(frame: str, filename: str, dimensions: list[int]) -> tuple[str, int]:
    source = ROOT / filename
    if not source.is_file():
        raise FileNotFoundError(source)
    if not WHITE.is_file() or not BLACK.is_file():
        raise FileNotFoundError("The bundled full-logo watermark PNG files are missing")

    source_width, source_height = dimensions
    luminance = bottom_right_luminance(source)
    watermark = BLACK if luminance >= 0.48 else WHITE
    watermark_color = "black" if watermark == BLACK else "white"
    widths = sorted({640, 960, 1280, min(1600, source_width), min(2400, source_width)})

    for target_width in widths:
        target_height = max(1, round(source_height * target_width / source_width))
        mark_width = max(72, round(target_width * 0.22))
        margin_x = max(12, round(target_width * 0.025))
        margin_y = max(12, round(target_height * 0.025))
        output = OUTPUT / f"{frame}-{target_width}.webp"
        output.parent.mkdir(parents=True, exist_ok=True)
        command = [
            "convert",
            "(", str(source), "-auto-orient", "-colorspace", "sRGB", "-resize", f"{target_width}x", ")",
            "(", str(watermark), "-resize", f"{mark_width}x", ")",
            "-gravity", "southeast", "-geometry", f"+{margin_x}+{margin_y}",
            "-compose", "over", "-composite", "-strip", "-define", "webp:method=6",
            "-quality", "90", str(output),
        ]
        environment = os.environ.copy()
        environment["MAGICK_THREAD_LIMIT"] = "2"
        subprocess.run(
            command,
            cwd=ROOT,
            env=environment,
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE,
            text=True,
        )
        actual = subprocess.check_output(
            ["identify", "-format", "%w", str(output)], cwd=ROOT, text=True
        ).strip()
        if int(actual) != target_width:
            raise RuntimeError(f"{frame}: expected {target_width}px, got {actual}px")

    return frame, len(widths)


def main() -> None:
    files, dimensions = read_manifest()
    items = [(frame, filename, dimensions[frame]) for frame, filename in files.items()]
    print(f"Generating watermarked renditions for {len(items)} active frames…", flush=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        completed = 0
        futures = [executor.submit(make_frame, *item) for item in items]
        for future in concurrent.futures.as_completed(futures):
            frame, variants = future.result()
            completed += 1
            print(f"[{completed}/{len(items)}] {frame}: {variants} sizes", flush=True)

    outputs = list(OUTPUT.glob("*.webp"))
    total_bytes = sum(path.stat().st_size for path in outputs)
    print(
        f"Done: {len(outputs)} WebP files, {total_bytes / (1024 * 1024):.1f} MiB. "
        "Source uploads were not changed."
    )


if __name__ == "__main__":
    main()
