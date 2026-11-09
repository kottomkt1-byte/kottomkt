#!/usr/bin/env python3
"""Render the authored HTML social card; requires Python Playwright/Chromium.

Uses only local fonts and the existing, unmodified portfolio thumbnail.
Usage: python scripts/render-kotto-industry-share.py [--output path.png]
"""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
import argparse
import hashlib
import json
import shutil

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = "scripts/kotto-industry-social-preview.html"
PHOTO = ROOT / "public/portfolio/model-images/thumbnails/tf5922-020-men-03.webp"


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path,
                        default=ROOT.parent / "images/kotto-industry-share.png")
    args = parser.parse_args()
    original_photo_hash = hashlib.sha256(PHOTO.read_bytes()).hexdigest()
    server = ThreadingHTTPServer(("127.0.0.1", 0), partial(QuietHandler, directory=str(ROOT)))
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(
                executable_path=shutil.which("chromium") or shutil.which("google-chrome"),
                headless=True, args=["--no-sandbox"])
            page = browser.new_page(viewport={"width": 1200, "height": 630}, device_scale_factor=1)
            page.goto(f"http://127.0.0.1:{server.server_port}/{TEMPLATE}", wait_until="networkidle")
            page.evaluate("""async () => {
                await document.fonts.ready;
                await Promise.all([...document.images].map(image => image.decode()));
            }""")
            checks = page.evaluate("""() => ({
                displayFont: document.fonts.check('450 45px "Kotto Display"'),
                textFont: document.fonts.check('450 17px "Kotto Text"'),
                imageLoaded: document.images[0].naturalWidth > 0,
                headingFits: [...document.querySelectorAll('h1 span')].every(line => line.scrollWidth <= line.clientWidth),
                canvasWidth: document.documentElement.scrollWidth,
                canvasHeight: document.documentElement.scrollHeight
            })""")
            assert all(checks[key] for key in ("displayFont", "textFont", "imageLoaded", "headingFits")), checks
            assert checks["canvasWidth"] == 1200 and checks["canvasHeight"] == 630, checks
            args.output.parent.mkdir(parents=True, exist_ok=True)
            page.screenshot(path=str(args.output), type="png", full_page=False)
            browser.close()
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=2)
    assert hashlib.sha256(PHOTO.read_bytes()).hexdigest() == original_photo_hash
    print(json.dumps({"file": str(args.output.resolve()), "width": 1200, "height": 630,
                      "bytes": args.output.stat().st_size,
                      "sha256": hashlib.sha256(args.output.read_bytes()).hexdigest(),
                      "source_photo": str(PHOTO), "source_photo_unchanged": True,
                      "checks": checks}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
