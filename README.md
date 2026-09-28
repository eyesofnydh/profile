# Eyes of Nydh

A responsive photography portfolio for Nidhin Narayanan. Built with plain HTML, CSS, and JavaScript; no build step or external runtime dependencies.

## Preview

From the project directory, run `python -m http.server 4173`, then open http://localhost:4173.

## Features

- Original navy and cyan palette with translucent glass panels with responsive layouts and existing original photographs.
- Collection search, category filters, and browser-local favorites.
- Accessible native photo dialog with previous/next controls, arrow keys, Escape, and focus restoration.
- Camera-dial desktop navigation inspired by https://epochtales.com/, with a moving label drum, fixed center pointer, scroll snapping, wheel gestures, and keyboard controls.
- Bottom mobile camera lens with a rotating focus ring, five-section fan menu, scroll tracking, touch targets, keyboard controls, and outside-click dismissal.
- Cinematic hero with three manually selectable photographs, a glass filmstrip, arrow-key controls, and reduced-motion support.
- Reading-progress indicator, photo reveals, pointer lighting, and animated headline entrances.
- Expandable glass navigation with staggered links and a glass mobile lens menu.
- A 27-photo archive with a layered journal, angled record shelf, and paginated photo wall.
- Drag, horizontal trackpad scrolling, arrow keys, and a range slider browse the 3D cards. Click a side card to select it; click the selected card to open it.
- Collapsible search/filter controls and a clickable strip of tilted photo prints near the footer.
- Thumbnail-strip navigation, frame counters, swipe navigation, and native-size viewing for small images.
- Scroll-linked hero depth, rotating ribbon details, and staggered photo reveals.
- Clearly labeled Pause motion / Enable motion control; system reduced-motion preferences always take priority.
- Three interactive photo essays (By the water, Into the green, After hours), each with a curated lightbox sequence.
- “Just the photograph” mode removes hero copy while keeping photo controls accessible.
- “Surprise me” opens a random photograph without immediately repeating the last discovery.
- Reduced-motion support, skip link, and content accessible without JavaScript.
- Direct Instagram and LinkedIn contact links; no nonfunctional contact form.

## Sanity checks

With the preview server running and Playwright available, run `node tests/sanity.cjs`.
You can set `PLAYWRIGHT_MODULE` to an existing Playwright module path, `CHROMIUM_PATH` to a Chromium executable, and `SITE_URL` to another preview URL.

The test covers 320, 375, 390, 768, 1024, and 1440px viewports, image loading, local anchor targets, search/filter combinations, empty states, favorites persistence, restricted browser storage, lightbox controls, keyboard/focus behavior, the mobile menu, reduced motion, and content without JavaScript. It also checks browser errors and failed HTTP responses, and generates desktop/mobile screenshots in `tests/`.

External social profile ownership and availability are not validated by this local test.

## Add more photographs

Place new images in `assets/images/`, then add an entry in `assets/js/photos.js` with `file`, `title`, `category`, descriptive `alt`, and the actual pixel `width` and `height`. Supported categories are Nature, Coast, Travel, and People. The gallery, search, favorites, random discovery, pagination, and viewer all use this collection. Use original high-resolution files where available; some existing photographs are thumbnails, and the viewer avoids stretching them.

## Archive interaction checks

Run `node tests/archive.cjs` with the same Playwright environment as the sanity test. It checks the journal and shelf, drag and native touch gestures, keyboard navigation, photo-wall pagination, filters, empty states, focus restoration, and responsive card bounds. Reference images were used for visual direction only; all displayed photographs come from the existing project assets.

Run `node tests/chapters.cjs` to verify motion labels, system preferences, story navigation, curated photo sequences, focus restoration, and responsive layouts.

Run `node tests/mobile-lens.cjs` to verify touch navigation, keyboard controls, responsive bounds, reduced motion, and desktop navigation.

## Image delivery and recovery

Gallery, story, and hero images use generated JPEG previews with responsive candidates; the viewer always opens the unchanged PNG originals. Regenerate previews after adding photos with `powershell -File tools/build-previews.ps1` (Windows, System.Drawing). The 800px preview set is about 0.93 MB versus 11.92 MB for the collection originals (92% smaller). Small originals are never enlarged during generation.

Save is available in the journal, shelf, photo wall, and viewer. Favorites persist in this browser when storage is available; otherwise a message explains that they last for this visit. Every empty layout offers a reset, and status describes the current layout and position.

The viewer can share a photo link using native sharing, clipboard copy, or a selectable link when those are unavailable. Links with `?photo=f4.png#gallery`, for example, reopen that original photograph. Contact guidance uses the existing Instagram and LinkedIn profiles. With JavaScript disabled, all 27 photographs remain available as links to originals.

Run `node tests/improvements.cjs` with the same browser environment as the other tests to check previews, original viewing, sharing fallback and deep links, Save synchronization, all-layout recovery, blocked storage, and JavaScript-free browsing.
