# DesignersMeet Website

Single-file production website for DesignersMeet — the AI-augmented freelance design marketplace.

## Deployment Options

### Option 1: GitHub Pages (Recommended — Free)

1. Push this folder to a GitHub repository (or it's already in `crm-app/designersmeet-website/`)
2. Go to repo **Settings → Pages**
3. Set **Source** to `Deploy from a branch`
4. Select `main` branch, folder `/designersmeet-website`
5. Click Save — your site is live at `https://<username>.github.io/<repo>/designersmeet-website/`

For a custom domain:
- Add a `CNAME` file in this folder with your domain (e.g. `designersmeet.com`)
- Point your DNS A records to GitHub Pages IPs: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`

### Option 2: GHL (GoHighLevel) Custom Code Page

1. In GHL, go to **Sites → Funnels** (or Pages)
2. Create a new page
3. Open the page editor → click **Custom Code** or **HTML block**
4. Paste the entire contents of `index.html`
5. Save and publish

The file is fully self-contained — all scripts and styles load from CDN. No server required.

### Option 3: Vercel (Already configured in this repo)

```bash
# From the crm-app root
vercel --prod
```

Or push to main and Vercel will auto-deploy via the existing `vercel.json` config.

### Option 4: Cloudflare Pages (Free)

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. Connect your GitHub repo
3. Set **build output directory** to `designersmeet-website`
4. Leave build command blank (static file, no build needed)
5. Deploy

### Option 5: Netlify Drop (Instant)

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag the `designersmeet-website` folder onto the page
3. Live instantly at a `netlify.app` subdomain

---

## What's Included

- **Five full service catalog sections** with pricing cards (Web, Mobile, Brand, UI/UX, AI Creative)
- **Three.js particle field** hero background (2,000 particles)
- **GSAP ScrollTrigger** animations throughout
- **3D tilt effect** on all cards
- **Portfolio grid** with filter tabs (12 projects)
- **Count-up stats** on scroll
- **Responsive** at 375px, 768px, 1440px
- **Mobile hamburger menu**
- **GHL compatible** — single self-contained HTML file

## Tech Stack (all CDN, no build)

- Three.js r128
- GSAP 3.12.2 + ScrollTrigger
- Tailwind CSS (CDN)
- Google Fonts: Space Grotesk + Inter

## Customisation

All brand variables are in the `:root` CSS block at the top of `index.html`:

```css
--bg: #0a0a14
--primary: #E94560
--purple: #7B61FF
--blue: #00d4ff
```

Pricing, copy, and portfolio projects can be updated directly in the HTML — no build step required.
