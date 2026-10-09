#!/usr/bin/env python3
"""Reproduce the silent KOTTO brand motion film with FFmpeg (no remote inputs).

Four authored brand images become a rostrum-camera film: industry detail,
editorial production, photographic print and a drawn neighbourhood. These are
brand illustrations, never presented as a client case or documentary footage.
"""
from pathlib import Path
import json
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "films"
OUT.mkdir(parents=True, exist_ok=True)
FPS = 24
# End shot returns to the exact initial camera position for the seamless loop.
SCENES = [
    ("optical-editorial.webp", 4.2, .70, "1.035+0.045*on/100", .65, .45),
    ("content-atelier.webp", 4.2, .56, "1.075-0.040*on/100", .48, .55),
    ("social-studio.webp", 4.2, .49, "1.035+0.038*on/100", .63, .42),
    ("neighborhood-atlas.webp", 4.2, .38, "1.075-0.040*on/100", .40, .58),
    ("optical-editorial.webp", 1.6, .70, "1.040-0.005*min(on/37,1)", .65, .45),
]

def run(args):
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *args], check=True)

def render(name, width, height, crf, maxrate, bufsize):
    with tempfile.TemporaryDirectory(prefix="kotto-brand-film-") as temp:
        clips = []
        # Crop before zooming, so the portrait export is independently framed.
        work_w, work_h = width * 2, height * 2
        for i, (image, duration, focus, zoom, px, py) in enumerate(SCENES):
            clip = Path(temp) / f"shot-{i}.mp4"
            crop_x = focus if name == "mobile" else .5
            vf = (f"scale={work_w}:{work_h}:force_original_aspect_ratio=increase,"
                  f"crop={work_w}:{work_h}:(iw-ow)*{crop_x}:(ih-oh)*0.5,"
                  f"zoompan=z='{zoom}':x='(iw-iw/zoom)*{px}':y='(ih-ih/zoom)*{py}':"
                  f"d=1:s={width}x{height}:fps={FPS},setsar=1,format=yuv420p")
            run(["-loop", "1", "-framerate", str(FPS), "-i", str(ROOT / "public/art" / image),
                 "-vf", vf, "-t", str(duration), "-an", "-c:v", "libx264", "-threads", "2",
                 "-preset", "fast", "-crf", "17", str(clip)])
            clips.append(clip)
        inputs = []
        for clip in clips:
            inputs.extend(["-i", str(clip)])
        # Masked editorial wipe, a lateral page registration and two soft cuts.
        graph = (
            "[0:v][1:v]xfade=transition=smoothleft:duration=0.8:offset=3.4[x1];"
            "[x1][2:v]xfade=transition=smoothup:duration=0.8:offset=6.8[x2];"
            "[x2][3:v]xfade=transition=fade:duration=0.8:offset=10.2[x3];"
            "[x3][4:v]xfade=transition=fade:duration=0.8:offset=13.6,format=yuv420p[out]"
        )
        destination = OUT / f"kotto-studio-{name}.mp4"
        run([*inputs, "-filter_complex_threads", "1", "-filter_complex", graph, "-map", "[out]",
             "-an", "-c:v", "libx264", "-threads", "2", "-profile:v", "main", "-level", "3.1",
             "-preset", "slow", "-crf", str(crf), "-maxrate", maxrate, "-bufsize", bufsize,
             "-movflags", "+faststart", "-pix_fmt", "yuv420p", "-r", str(FPS), str(destination)])
        poster_name = "kotto-studio-poster.webp" if name == "desktop" else "kotto-studio-poster-mobile.webp"
        run(["-i", str(destination), "-frames:v", "1", "-c:v", "libwebp", "-quality", "82", str(OUT / poster_name)])
        probe = subprocess.check_output(["ffprobe", "-v", "quiet", "-show_format", "-show_streams", "-of", "json", str(destination)])
        result = json.loads(probe)
        print(json.dumps({"file": destination.name, "bytes": destination.stat().st_size,
                          "seconds": result["format"]["duration"], "width": width, "height": height,
                          "fps": FPS}, ensure_ascii=False))

if __name__ == "__main__":
    render("desktop", 1280, 720, 24, "1350k", "2000k")
    render("mobile", 540, 676, 28, "460k", "690k")
