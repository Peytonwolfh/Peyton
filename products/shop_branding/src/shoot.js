const { chromium } = require('playwright');
const path = require('path');

const SRC = __dirname;
const OUT = path.join(__dirname, '..');

const jobs = [
  { file: 'logo.html', out: 'logo.png', w: 500, h: 500 },
  { file: 'banner-big.html', out: 'banner-big.png', w: 3360, h: 840 },
  { file: 'banner-mini.html', out: 'banner-mini.png', w: 1600, h: 213 },
];

(async () => {
  const browser = await chromium.launch();
  for (const j of jobs) {
    const page = await browser.newPage({
      viewport: { width: j.w, height: j.h },
      deviceScaleFactor: 1,
    });
    await page.goto('file://' + path.join(SRC, j.file));
    await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(OUT, j.out) });
    await page.close();
    console.log('wrote', j.out);
  }
  await browser.close();
})();
