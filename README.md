# the’apostrophe portfolio

A static photography portfolio for portraits, studio days, street work, and
friends. It can be opened directly from `index.html` or served from the
repository root; no build step or backend is required.

## Site

- **Intro and hero:** the approved no-tagline PNG lockup shows the golden
  apostrophe. The hero has five slides and retains the scroll animation: the
  full lockup fades while a separate white icon moves into the navigation.
  The Analog Nights frame is not in the hero; the Night series remains intact.
- **Series:** all 34 active frames across the same seven chapters.
- **Muses:** five named subjects and their complete photo reels.
- **About:** copy remains editable in `js/data.js`.
- **Services:** a static `#services` section lists portrait sessions, studio
  sessions, event coverage, and street/creative work, plus a three-step booking
  process. It is plain HTML so crawlers that do not run JavaScript still read it.
- **FAQ:** a static `#faq` section answers the six questions that mirror the
  `FAQPage` structured data.
- **Contact:** `contact@theapostrophe.media` opens a mail link; Instagram links
  to `@theapostrophemedia`.
- **Footer:** uses the white wordmark watermark PNG.

The hero keeps `park-4` as the Dusk Wanderer feature. City Noir credits Umair;
`park-4` is credited to Hasib and the other Dusk Wanderer frames to Ahanaf.

## Branding assets

The intro and hero lockup use
`theapostrophe-logo-kit/no-tagline-ivory-transparent.png`, which retains the
golden apostrophe. Standalone marks (favicon, navigation, contact, and the
scroll handoff) use `theapostrophe-logo-kit/icon-white.png`. The footer uses
`theapostrophe-logo-kit/watermarks/watermark-wordmark-white.png`.

Photo pages use responsive, watermarked WebP renditions from:

```text
assets/img/watermarked/<frame-id>-640.webp
assets/img/watermarked/<frame-id>-960.webp
assets/img/watermarked/<frame-id>-1280.webp
assets/img/watermarked/<frame-id>-1600.webp
assets/img/watermarked/<frame-id>-<up-to-2400>.webp
```

The site uses `srcset`/`sizes` to select renditions for each viewport. The
original source uploads at the repository root remain unchanged. To regenerate
photo renditions after changing the active image manifest, run:

```sh
python3 scripts/generate_watermarked.py
```

The script requires Node.js and ImageMagick (`convert` and `identify`); it reads
`js/data.js` and `js/sizes.js` and does not modify source uploads.

## Search and AI visibility

Search and AI answer engines are handled by files at the repository root:

- `index.html` — title, meta description, and a JSON-LD `@graph` holding
  `LocalBusiness` / `PhotographyBusiness`, `Person` (Waimeer Chowdhury and
  Umair), `WebSite`, `WebPage`, and `FAQPage` nodes.
- `robots.txt` — allows all crawlers, with explicit allowances for Google,
  Bing, GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Applebot, and CCBot.
- `sitemap.xml` — the single canonical URL.
- `llms.txt` — a plain-language summary of the business for AI tools that read
  it (Google does not require or read this file).

The Services and FAQ copy lives directly in `index.html`, not in `js/data.js`,
so it is present in the raw HTML. If you change a question or answer, update the
`FAQPage` node in the JSON-LD at the same time. Open `SEO.md` for the off-site
steps (Google Business Profile, Search Console, listings) that decide whether
Google describes the business correctly.

## Editing and local preview

Edit `js/data.js` for the series, hero slides, featured Work photos, Muses,
About copy, and contact details. Keep `imageSources`, `series`, `heroSlides`,
and `js/sizes.js` in sync. `js/sizes.js` records oriented image dimensions so
browsers can reserve the right space while images load.

To serve the site locally on port 8080:

```sh
python3 -m http.server 8080 --bind 0.0.0.0
```

Keyboard controls: `←` / `→` change hero slides or move through a focused strip;
`F` toggles focus mode; `Esc` closes the viewer or exits focus mode.

The site disables image dragging and the context menu on displayed photos and
logo images as lightweight deterrents, not copy protection. Screenshots, direct
image URLs, source inspection, and browser tools can still save or reproduce
images. `prefers-reduced-motion` is respected.
