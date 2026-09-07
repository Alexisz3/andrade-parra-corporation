# Andrade Parra Corporation — V7 implementation brief

## Purpose

Implement the approved V7 “Warm Craft” direction in the existing bilingual Next.js application. The preserved HTML prototype at `docs/redesign/v7-reference.html` is the visual source of truth; the application repository remains the source of truth for routes, content, contact data, form behavior, privacy, SEO, and accessibility.

## Branch and safety

- Working branch: `redesign/v7-final`.
- Base: latest `origin/main` at implementation start (`a56d81b8c8bedc6dca33ac383978734cc17ea84b`).
- `main` must remain unchanged.
- No deployment, merge, DNS change, or production activation is part of this branch.
- Original client ZIPs and source photography stay untracked and unchanged.

## Visual system

- Direction: warm, tactile, editorial construction portfolio; image-led rather than dashboard-like.
- Core colors: Espresso `#171512`, Espresso 2 `#211E1A`, Ink `#201C18`, Plaster `#F4F0E8`, Paper `#FCFAF6`, Sand `#B8AA99`, Muted `#665F58`, Amber `#F5871F`, Clay `#D9782D`, accessible accent text `#A95316`, WhatsApp `#25D366`.
- Type: Source Sans 3 for UI/body, Newsreader for selective editorial emphasis, Barlow Condensed for metadata and small labels.
- Use the existing official logo assets. Do not redraw or approximate the mark.
- Corners, shadows, borders, and motion stay restrained. Photography and hierarchy do the visual work.

## Homepage architecture

1. Sticky transparent-to-solid header.
2. Rotating real-project hero with localized project metadata and accessible controls.
3. Small trust strip containing only verified facts.
4. Project library with data-derived category counts and localized internal links.
5. Editorial, numbered service selector backed by the real services registry.
6. Before/after only when a pair is explicitly confirmed in `content/before-after.ts`.
7. “APC detail” craft section using a real close-up image and subtle CSS motion.
8. Compact company/direct-contact section based only on confirmed people and facts.
9. Accessible FAQ accordion.
10. Contact/quote handoff that preserves the current form and routing logic.
11. Low-density footer.

The homepage must not contain a process section. Dedicated `/es/proceso` and `/en/process` routes remain available.

## Interaction requirements

- Hero auto-rotation: 8 seconds, crossfade around 900 ms, subtle zoom, preload only the next image.
- Project library rhythm: 9 seconds, scroll snap and touch swipe, previous/pause/next buttons, keyboard support, current/total status, and progress.
- Both autoplay systems pause while off-screen, while the document is hidden, while the user is interacting, and when the user pauses them.
- `prefers-reduced-motion` disables autoplay and decorative transforms.
- All controls need visible focus, 44 px minimum touch targets, useful accessible names, and non-color state cues.

## Content and integrity

- No stock or generated architecture imagery.
- No invented years, project totals, reviews, licenses, insurance, awards, guarantees, addresses, office status, project duration, scope, or outcomes.
- Project/category counts are always derived from `content/projects.ts`.
- Preserve next-intl routing, localized slugs, canonical/hreflang behavior, sitemap, analytics, and quote draft/handoff behavior.
- Official WhatsApp icon remains green and links use the existing contact assignment logic.

## New client photography review (2026-09-05)

The 23 new images in `imagenes reales.zip` were reviewed individually. They contain four identifiable groups:

1. Large residential exterior/pool context — one 2048×1536 landscape image. Useful only with a privacy-safe crop because a person appears near the lower edge.
2. Blue/white bathroom renovation — six images, a mix of finished surfaces and incomplete outlet/fixture details. Suitable as an in-progress bathroom project; strongest images are the tub/vanity and shower detail.
3. Window and brick installation — two images with a worker visible. Keep out of the public site until publication consent is confirmed.
4. Bathroom/plumbing rebuild — fourteen progress images showing rough plumbing, framing, waterproofing, floor tile, and shower tile. Suitable as a separate in-progress project when using the no-person frames.

Selected public images must be copied with descriptive sanitized filenames. Frames with clearly visible workers remain in the client ZIP only. Publication still requires the final owner/client photo authorization described in the repository’s privacy checklist.

## Responsive acceptance

- Mobile-first checks at 360, 375, 390, and 430 CSS px.
- Tablet and desktop checks, including 1366, 1440, and 1920 CSS px.
- No horizontal page overflow, clipped copy, accidental overlap, or fixed UI covering content.
- Navigation, language switching, project filtering, carousels, accordions, quote flow, phone links, WhatsApp links, and all localized routes must remain usable with touch and keyboard.

## Verification gates

Run from a clean lockfile install where practical, then:

- `npm run typecheck`
- `npm run lint`
- `npm run check:i18n`
- `npm run build`
- production-server functional, accessibility, visual, and Lighthouse checks on port 4318

The branch is ready for review only when blocking errors are resolved and known external launch dependencies are reported honestly.
