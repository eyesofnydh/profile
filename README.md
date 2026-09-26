# Eyes of Nydh

A responsive photography portfolio for Nidhin Narayanan. Built with plain HTML, CSS, and JavaScript; no build step or external runtime dependencies.

## Preview

From the project directory, run `python -m http.server 4173`, then open http://localhost:4173.

## Features

- Original navy and cyan palette with translucent glass panels with responsive layouts and existing original photographs.
- Collection search, category filters, and browser-local favorites.
- Accessible native photo dialog with previous/next controls, arrow keys, Escape, and focus restoration.
- Camera-dial desktop navigation inspired by https://epochtales.com/, with a moving label drum, fixed center pointer, scroll snapping, wheel gestures, and keyboard controls.
- Mobile menu with keyboard and outside-click dismissal.
- Cinematic hero with three manually selectable photographs, a glass filmstrip, arrow-key controls, and reduced-motion support.
- Reading-progress indicator, photo reveals, pointer lighting, and animated headline entrances.
- Expandable glass navigation with staggered links and a sliding mobile menu.
- Editorial and contact-sheet gallery layouts.
- Persistent motion pause control; system reduced-motion preferences always take priority.
- “Just the photograph” mode removes hero copy while keeping photo controls accessible.
- “Surprise me” opens a random photograph without immediately repeating the last discovery.
- Reduced-motion support, skip link, and content accessible without JavaScript.
- Direct Instagram and LinkedIn contact links; no nonfunctional contact form.

## Sanity checks

With the preview server running and Playwright available, run `node tests/sanity.cjs`.
You can set `PLAYWRIGHT_MODULE` to an existing Playwright module path, `CHROMIUM_PATH` to a Chromium executable, and `SITE_URL` to another preview URL.

The test covers 320, 375, 390, 768, 1024, and 1440px viewports, image loading, local anchor targets, search/filter combinations, empty states, favorites persistence, restricted browser storage, lightbox controls, keyboard/focus behavior, the mobile menu, reduced motion, and content without JavaScript. It also checks browser errors and failed HTTP responses, and generates desktop/mobile screenshots in `tests/`.

External social profile ownership and availability are not validated by this local test.
