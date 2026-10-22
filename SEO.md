# Getting Google (and other AI assistants) to describe The Apostrophe Media correctly

Goal: when someone searches **“theapostrophe media”** — or asks an AI assistant
“who is the photographer behind The Apostrophe Media in New York?” — the answer
should describe *your* studio: New York City, portraits / studio / events /
street, run by Waimeer Chowdhury, contactable at contact@theapostrophe.media.

Two different things have to happen, and only one of them happens on this
website:

1. **The entity exists in Google’s business data.** That is the Google Business
   Profile. It is the #1 source for AI Overviews, AI Mode, Gemini and Maps
   answers about a local business — studies of AI Mode citations put Google’s
   own properties far ahead of any other source.
2. **The website explains the entity in plain, structured language.** That is
   what was added here: visible service copy, an FAQ, and `LocalBusiness` +
   `Person` + `WebSite` + `FAQPage` structured data.

Google’s own documentation says there is no special file or schema *required* to
appear in AI Overviews or AI Mode — the pages just need to be indexed, clear, and
backed by accurate Business Profile data (`llms.txt`, added here, is read by
other AI tools such as ChatGPT/Perplexity crawlers, not by Google).

---

## 1. What was changed in this repo

| Change | Why it matters |
| --- | --- |
| `<title>` is now “The Apostrophe Media — New York Portrait, Event & Studio Photographer” | The business name leads the title, so the brand query matches first. |
| Meta description rewritten with the city, the services, and the email | Shown as the snippet, and read by AI answer engines. |
| New **Services** section (`#services`) with four offers and a 3-step booking process | Real text about what the business sells — that is what AI systems quote. Photos alone tell them nothing. |
| New **FAQ** section (`#faq`) with six questions | Direct question/answer pairs are the easiest thing for an AI to lift into an answer. |
| `LocalBusiness` + `PhotographyBusiness` + `ProfessionalService` schema with name, alternate names, email, city, area served, founder, services catalogue | Gives Google a machine-readable description of the business. |
| `Person` schema for Waimeer Chowdhury (and Umair) | Connects the photographer to the studio and to the portfolio. |
| `WebSite`, `WebPage` and `FAQPage` schema | Ties the page, the site, and the Q&A together as one entity. |
| Alt text rewritten for hero, series and portrait images | Descriptive alts (“City Noir — Umair, New York portrait photography, frame 1 of 6”) instead of “frame 1”. |
| Footer now reads “© 2026 The Apostrophe Media · New York, NY” | Reinforces name + city in the page’s text. |
| `robots.txt` explicitly allows Google, Bing, GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Applebot, CCBot | No accidental blocking of AI crawlers. |
| `llms.txt` added | A short, plain-language summary of the business for AI tools that read it. |
| `sitemap.xml` unchanged in shape | One page, still valid; resubmit after changes. |

Everything above is static HTML — it is visible to crawlers that do **not** run
JavaScript (GPTBot, ClaudeBot, PerplexityBot), not just to Googlebot.

---

## 2. Do these five things off the site (in this order)

### a) Google Business Profile — the single biggest lever

Create or claim a profile at <https://business.google.com>. A photographer can
register as a **service-area business** (no storefront address shown publicly),
which fits a New York City photographer who shoots on location.

- **Business name:** `The Apostrophe Media` — exactly this, no keyword stuffing.
- **Primary category:** `Photographer`. Secondary: `Portrait studio`,
  `Event photographer`, `Commercial photographer` (only ones that are true).
- **Service area:** New York City (and any boroughs/areas you actually serve).
- **Website:** `https://theapostrophe.media/`
- **Description (750 chars max) — copy/paste:**

  > The Apostrophe Media is a New York City photography studio led by Waimeer
  > Chowdhury. We shoot natural, unposed portraits, studio sessions with a mood
  > and theme built around you, event coverage, and street-led creative work.
  > Sessions take place on location across the five boroughs or against a simple
  > studio backdrop, and every booking starts with a conversation about ideas,
  > frames, and emotion. Email contact@theapostrophe.media or message
  > @theapostrophemedia on Instagram.

- **Services:** add each of the four services from the site with the same
  wording (Portrait sessions, Studio sessions, Event coverage, Street & creative
  work).
- **Photos:** 10–20 real frames, including the portrait of Waimeer.
- **Hours / phone:** add a phone if you want calls; keep hours accurate.
- **Verification:** video verification is normal for service-area businesses —
  show your camera, your ID, and your workspace.

Reviews are what AI Mode leans on hardest. After each session, send the client
the Google review link and reply to every review.

### b) Google Search Console

Verify `theapostrophe.media` (DNS or HTML file), submit
`https://theapostrophe.media/sitemap.xml`, then use **URL Inspection → Request
indexing** on the homepage. This is also where you see which queries already
surface the site.

### c) Bing Webmaster Tools + IndexNow

Bing feeds Copilot, and is a second index that other assistants use. Import the
site from Search Console, submit the sitemap, and enable IndexNow.

### d) Consistency (NAP + `sameAs`)

The name, city, email, and Instagram handle must match **exactly** everywhere:
the site, Google Business Profile, Instagram bio, LinkedIn, Facebook, Yelp,
Thumbtack, Behance/VSCO, any directory. AI systems get less confident when
details conflict. Add every profile you create to the `sameAs` array in the
`index.html` schema so the site links to them explicitly.

### e) Links and mentions

A new domain with no inbound links is hard for a brand query to win — right now
“theapostrophe media” returns Apostrophe Reps (NYC) and Apostrophe Media (Gulf
Shores, AL), not you. Fix that with:

- Instagram bio link → the site (already the strongest signal you control).
- A LinkedIn profile for Waimeer listing The Apostrophe Media as the employer,
  with the site in the profile.
- Free, real listings: Yelp, Thumbtack, NYC photographer directories, local
  creative collectives, university photo clubs, any market/event you shoot.
- Ask the people you shoot with (Umair, Hasib, Moskayet, Ahanaf) to credit
  “Shot by The Apostrophe Media — theapostrophe.media” when they post the work.
- One or two local mentions: a neighbourhood blog, a campus paper, a venue’s
  vendor list. A single regional mention outranks twenty spammy directories.

---

## 3. The brand-collision problem (read this once)

“Apostrophe” is a crowded name in photography: **Apostrophe Reps** (a large NYC
agency) and **Apostrophe Media** (a Gulf Shores, Alabama marketing company) both
rank for the phrase. You will not out-rank them on the generic phrase quickly, so:

- Always use the full name **The Apostrophe Media** together with **New York**
  and **Waimeer Chowdhury**, which is what the schema, title, FAQ and `llms.txt`
  now do.
- Never write just “Apostrophe” as the business name on a listing.
- Keep the exact domain `theapostrophe.media` in every profile.
- The `disambiguatingDescription`-style sentence in `llms.txt` (“distinct from
  Apostrophe Reps…”) exists for this reason.

---

## 4. Next content steps (when you want more than the brand query)

The site is currently one page. One page can rank for the brand and for a
handful of long-tail phrases; it cannot rank for “NYC portrait photographer”,
“event photographer Brooklyn”, etc. When you are ready:

1. Split the services into their own pages, each with a real gallery:
   `/portrait-photography-new-york/`, `/studio-sessions/`,
   `/event-photography-new-york/`.
2. Give each series its own page (`/series/city-noir/`) with the frames, where
   it was shot, and who is in it — those pages are what earn links and quotes.
3. Add a short journal: one post per shoot (“Dusk in Queens”, “Studio test with
   Umair”), 300–600 words with the photos. Fresh, specific pages are what AI
   answers cite for non-brand questions.
4. Add `Service` + `ImageObject` schema per page, and copy the FAQ pattern.
5. Add each new URL to `sitemap.xml` and keep `lastmod` honest.

---

## 5. How to check progress

- Search `theapostrophe media` in an incognito window, and ask Google’s AI Mode
  “who is the photographer behind The Apostrophe Media?” — before/after.
- Search Console → Performance → filter by the brand query.
- Google Business Profile → Performance (calls, direction requests, profile
  views, searches).
- Rich Results Test (<https://search.google.com/test/rich-results>) on the
  homepage — expect `LocalBusiness` and `FAQ` to be detected.
- Schema Markup Validator (<https://validator.schema.org/>) — expect zero errors.

Realistic timing: indexing changes in days, Google Business Profile effects in
weeks, and any movement on non-brand queries in a few months.
