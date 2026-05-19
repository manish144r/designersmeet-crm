import { chromium } from 'playwright';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const MOCK = 'C:\\Users\\smani\\CompanyWorkspaces\\Designersmeet\\crm-app\\brief\\mockups';
const SHOTS = 'C:\\Users\\smani\\CompanyWorkspaces\\Designersmeet\\crm-app\\brief\\screenshots';
const EXE = 'C:\\Users\\smani\\AppData\\Local\\ms-playwright\\chromium-1222\\chrome-win64\\chrome.exe';

const files = readdirSync(MOCK).filter((f) => f.endsWith('.html'));
const browser = await chromium.launch({ executablePath: EXE, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
let ok = 0, fail = 0;
for (const f of files) {
  const url = pathToFileURL(join(MOCK, f)).href;
  const out = join(SHOTS, f.replace(/\.html$/, '.png'));
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.screenshot({ path: out, fullPage: true });
    ok++; console.log('OK  ' + f);
  } catch (e) {
    fail++; console.log('FAIL ' + f + ' :: ' + e.message);
  }
}
await browser.close();
console.log(`SCREENSHOTS: ok=${ok} fail=${fail} of ${files.length}`);
