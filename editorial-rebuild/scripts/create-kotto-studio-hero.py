#!/usr/bin/env python3
"""Build a full-width, silent three-panel KOTTO hero from existing photographs.

No pixels of the source files are changed. Only camera crops and cross-dissolves
are rendered. Requires Python/Pillow and FFmpeg; no remote assets are used.
Usage: python scripts/create-kotto-studio-hero.py [--preview-only]
"""
from pathlib import Path
from functools import lru_cache
import argparse
import hashlib
import json
import subprocess

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
PHOTOS = ROOT / "public/portfolio/model-images"
OUTPUT = ROOT / "public/films"
WIDTH, HEIGHT, FPS, SECONDS = 1440, 600, 24, 22
PANEL_WIDTH = WIDTH // 3
GROUPS = (
    ("tf6032-001-women-01", "tf1381-01a-men-03", "tf1380-01a-women-03"),
    ("tf5922-020-women-03", "tf5922-020-men-03", "tf1290-08a-women-01"),
    ("tf1289-01a-women-03", "tf1387-52f-men-03", "tf1290-28a-women-03"),
)
STARTS = (0.0, 6.85, 13.7)
DISSOLVE = 1.15
LOOP_START, LOOP_END = 20.6, 21.8


def ease(value):
    value = min(1.0, max(0.0, value))
    return value * value * (3.0 - 2.0 * value)


@lru_cache(maxsize=9)
def photo(name):
    return Image.open(PHOTOS / f"{name}.webp").convert("RGB")


def panel(name, progress, group, column):
    source = photo(name)
    iw, ih = source.size
    p = ease(progress)
    if (column + group) % 2:
        p = 1.0 - p
    zoom = 1.02 + .035 * p
    scale = max(PANEL_WIDTH / iw, HEIGHT / ih) * zoom
    crop_width, crop_height = PANEL_WIDTH / scale, HEIGHT / scale
    # Near-original 4:5 framing retains the complete face. The upper edge is
    # anchored to preserve hair and eye positions, with only a tiny side drift.
    left = (iw - crop_width) * (.48 + .04 * p)
    top = (ih - crop_height) * .07
    return source.resize((PANEL_WIDTH, HEIGHT), Image.Resampling.BICUBIC,
                         box=(left, top, left + crop_width, top + crop_height))


def group_frame(index, elapsed):
    frame = Image.new("RGB", (WIDTH, HEIGHT))
    progress = min(1.0, max(0.0, elapsed / 8.0))
    for column, name in enumerate(GROUPS[index]):
        frame.paste(panel(name, progress, index, column), (column * PANEL_WIDTH, 0))
    return frame


@lru_cache(maxsize=1)
def first_frame():
    return group_frame(0, 0.0)


def frame_at(t):
    if t >= LOOP_END:
        return first_frame().copy()
    index = max(i for i, start in enumerate(STARTS) if t >= start)
    elapsed = t - STARTS[index]
    frame = group_frame(index, elapsed)
    if index and elapsed < DISSOLVE:
        previous = group_frame(index - 1, t - STARTS[index - 1])
        frame = Image.blend(previous, frame, ease(elapsed / DISSOLVE))
    if t >= LOOP_START:
        frame = Image.blend(frame, first_frame(), ease((t - LOOP_START) / (LOOP_END - LOOP_START)))
    return frame


def preview(directory):
    directory.mkdir(parents=True, exist_ok=True)
    times = (0.0, 4.5, 9.5, 16.5, 21.2, (SECONDS * FPS - 1) / FPS)
    sheet = Image.new("RGB", (1440, 972), "#f3f0e8")
    draw = ImageDraw.Draw(sheet)
    for index, time in enumerate(times):
        frame = frame_at(time)
        frame.save(directory / f"frame-{index}.jpg", quality=92)
        x, y = index % 2 * 720, index // 2 * 324
        sheet.paste(frame.resize((720, 300), Image.Resampling.LANCZOS), (x, y))
        draw.text((x + 10, y + 306), f"{time:.3f}s", fill="#282923")
    sheet.save(directory / "contact-sheet.jpg", quality=93)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--preview-only", action="store_true")
    parser.add_argument("--preview-dir", type=Path, default=Path("/tmp/kotto-studio-wide"))
    args = parser.parse_args()
    preview(args.preview_dir)
    if args.preview_only:
        print(args.preview_dir / "contact-sheet.jpg")
        return
    OUTPUT.mkdir(parents=True, exist_ok=True)
    movie = OUTPUT / "kotto-studio-wide.mp4"
    command = [
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{WIDTH}x{HEIGHT}",
        "-r", str(FPS), "-i", "pipe:0", "-an",
        "-c:v", "libx264", "-preset", "medium", "-threads", "3",
        "-crf", "23", "-maxrate", "1000k", "-bufsize", "2000k",
        "-force_key_frames", "0,6.85,13.7,21.8",
        "-profile:v", "high", "-level", "4.1", "-pix_fmt", "yuv420p",
        "-movflags", "+faststart", "-t", str(SECONDS), str(movie),
    ]
    process = subprocess.Popen(command, stdin=subprocess.PIPE)
    try:
        for index in range(SECONDS * FPS):
            process.stdin.write(frame_at(index / FPS).tobytes())
            if index % (FPS * 5) == 0:
                print(f"Studio wide: {index // FPS}s / {SECONDS}s", flush=True)
    finally:
        process.stdin.close()
    if process.wait():
        raise RuntimeError("FFmpeg could not encode the studio hero")
    poster = OUTPUT / "kotto-studio-wide-poster.webp"
    first_frame().save(poster, quality=90, method=6)
    probe = json.loads(subprocess.check_output([
        "ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(movie)
    ]))
    assert len(probe["streams"]) == 1 and probe["streams"][0]["codec_type"] == "video"
    assert frame_at(0).tobytes() == frame_at((SECONDS * FPS - 1) / FPS).tobytes()
    assert movie.stat().st_size < 3_000_000, "Hero exceeds the 3 MB budget"
    print(json.dumps({
        "movie": str(movie), "poster": str(poster), "width": WIDTH, "height": HEIGHT,
        "fps": FPS, "seconds": float(probe["format"]["duration"]),
        "frames": SECONDS * FPS, "audio": False, "bytes": movie.stat().st_size,
        "sha256": hashlib.sha256(movie.read_bytes()).hexdigest(),
        "first_and_last_source_frames_identical": True,
        "contact_sheet": str(args.preview_dir / "contact-sheet.jpg"),
        "source_groups": GROUPS,
    }, ensure_ascii=False, indent=2), flush=True)


if __name__ == "__main__":
    main()
