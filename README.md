# Emerald Hour ✦

The photography portfolio of **Waimeer Chowdhury** — personal shoots, portraits and events, photographed in and around New York City.

**Emerald Hour** is a portfolio-first site (no booking flow): an animated, interactive gallery built on an emerald-green & white theme, using the photographs committed at the root of this repository.

## Highlights

- **Emerald & white theme** with a sunset-lens logo mark (a camera lens with an emerald sunset inside) (`assets/logo-mark.svg`, favicon `assets/favicon.svg`)
- **Animated intro** — logo stroke-draw preloader with counter, curtain reveal
- **Kinetic hero** — masked line reveal, scramble-decode eyebrow, Ken-Burns cross-fading slideshow, marquee band
- **Interactive gallery** — category filters (Studio / Street & Flash / Concept / Outdoors), masonry layout, hover captions, full lightbox with keyboard + swipe navigation
- **Series rail** — drag-to-scroll horizontal chapters with 3D tilt cards
- **Micro-interactions** — custom cursor with "view" state, magnetic buttons, scroll-progress bar, word-by-word statement reveal, animated counters, parallax portrait, film-grain overlay
- Fully responsive with a circular-clip mobile menu; honours `prefers-reduced-motion`

## Structure

```
index.html            single-page portfolio
css/style.css         theme, layout, animations
js/main.js            all interactions (vanilla JS, no dependencies)
assets/fonts/         Fraunces + Space Grotesk (self-hosted, variable woff2)
assets/img/thumb/     gallery grid images (optimized)
assets/img/full/      lightbox & hero images (optimized, max 1600px)
assets/logo-mark.svg  sunset-lens logo mark
assets/favicon.svg    favicon
*.jpg / *.png (root)  original master photographs
```

## Run locally

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Notes

- Instagram link (`@waimeerchowdhury`) appears in the footer; the top-right nav button is "Contacts" and jumps to the footer. Swap the handle in `index.html` if needed.
- Originals at the repo root are untouched masters; the site only loads the optimized copies under `assets/img/`.
