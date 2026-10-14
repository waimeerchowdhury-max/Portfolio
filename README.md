# the’apostrophe portfolio

A static photography portfolio for portraits, studio days, street work, and
friends. It can be opened directly from `index.html` or served from the
repository root; no build step or backend is required.

## Site

- **Intro and hero:** the approved no-tagline PNG lockup shows the golden
  apostrophe. The hero has five slides and retains the scroll animation: the
  full lockup fades while a separate white icon moves into the navigation.
  The Analog Nights frame is not in the hero; the Night series remains intact.
- **Work:** three featured photographs; each opens its complete series.
- **Series:** all 34 active frames across the same seven chapters.
- **Muses:** five named subjects and their complete photo reels.
- **About:** copy remains editable in `js/data.js`.
- **Contact:** `team.theapostrophe@gmail.com` opens a mail link; Instagram links
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
