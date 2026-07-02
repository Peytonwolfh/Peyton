import os
from pathlib import Path
from playwright.sync_api import sync_playwright

SRC = Path(__file__).parent
OUT = SRC.parent

jobs = [
    ("logo.html", "logo.png", 500, 500),
    ("banner-big.html", "banner-big.png", 3360, 840),
    ("banner-mini.html", "banner-mini.png", 1600, 213),
]

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path="/opt/pw-browsers/chromium")
    for file, out, w, h in jobs:
        page = browser.new_page(viewport={"width": w, "height": h}, device_scale_factor=1)
        page.goto((SRC / file).as_uri())
        page.wait_for_timeout(150)
        page.screenshot(path=str(OUT / out))
        page.close()
        print("wrote", out)
    browser.close()
