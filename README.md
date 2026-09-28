# Eyes of Nydh

A responsive photography portfolio for Nidhin Narayanan. Built with plain HTML, CSS, and JavaScript; no framework or external runtime dependencies. The travel chapter includes an optional static-page generator.

## My Journey — travel extension

Open [the local travel chapter](http://localhost:4173/travel.html). A prominent homepage My Journey section, menu entry, and footer link lead to it; the existing homepage sections, camera navigation, gallery, and shared styles are unchanged. Travel uses the same navy/cyan colors, Segoe UI and Georgia accents, spacing scale, original archive images, responsive preview pipeline, and saved motion preference. The full journal CSS and JavaScript load only on `travel.html`; the homepage preview uses the existing homepage styles.

### Local development and production

1. **Dependencies:** no npm install, framework, map SDK, API key, or environment variables are needed. Python 3.9+ is needed only to regenerate the static page and run the local server. A browser can also view the checked-in HTML directly.
2. **Start:** from the repository root, run `python -m http.server 4173`.
3. **Local URLs:** homepage `http://localhost:4173/`; travel `http://localhost:4173/travel.html`.
4. **Production generation:** run `python tools/build-travel.py`, then `python tools/build-travel.py --check`. This generates the checked-in `travel.html` from the data and template. It also updates only the marked Journey preview block in the homepage. There is no bundling step for this static site.
5. **Production preview:** serve the same repository root with `python -m http.server 4173`; these are the exact static HTML/CSS/JS/assets served in production.

Netlify can continue publishing the same site root with its existing settings. Commit the generated `travel.html` alongside the travel data, CSS, and JS. No SPA rewrite is needed: `/travel.html` is a real file, and story URLs such as `/travel.html#story-munnar` use local anchors. No deployment configuration was added or changed. Local validation does not deploy the website.

### Updating trips

Edit `assets/data/travel.json`, then regenerate the page. Each destination has an ID, name, region, year, date, duration, cover image, photo list, introduction, story paragraphs, travel details, memory, and optional latitude/longitude. IDs should stay stable so saved story links continue to work.

- `sample: true` labels the dummy journal and adds `noindex,follow`. Change it to `false` after replacing the example trips with verified content. The canonical URL is set in `tools/travel-template.html`; update it if the production domain changes.
- `stats.trips` and `stats.distanceKm` accept real totals or `null` (displayed as a dash). Destination/photo counts come from the data. The dummy examples do not claim real trip totals.
- `currently` and `kit` are editable separately. Remove kit entries to omit those items.
- Image filenames refer to `assets/js/photos.js`. To add new photographs, follow the existing photo workflow below, generate previews, and reference the filename in the travel data. The travel page reuses JPEG previews rather than adding another image toolchain; full originals open from the moments gallery.
- The lightweight map is a coordinate-based location sketch, not a street map or a claimed travel route. It runs locally without tiles or a third-party service. Entries without valid coordinates still appear in the destination/story sections.
- Missing optional story fields render readable placeholders. Failed images render a text fallback; content and navigation remain usable. With JavaScript disabled, native story disclosures, destination links, and original-photo links still work.

The generator is split into destination, story, memory, map, image, and page functions in `tools/build-travel.py`; page structure lives in `tools/travel-template.html`. Runtime interactions live in `assets/js/travel.js`, with page-scoped styling in `assets/css/travel.css`.

### Travel validation

- `python tests/travel-build.py`: incomplete data, empty collection, safe text/IDs, invalid coordinates, and sample indexing behavior.
- `python tools/build-travel.py --check`: generated production HTML matches the data/template and referenced previews exist.
- `node tests/travel.cjs`: homepage integration; stories and direct links; all map markers; desktop horizontal and mobile vertical destinations; touch/keyboard controls; all eight requested widths (375, 390, 414, 768, 1024, 1280, 1440, 1920); images and local links; SEO metadata; reduced motion; no JavaScript; failed images and blocked storage. Uses the same Playwright environment described below.
- Existing gallery/navigation tests remain applicable. The gallery-experience test now waits for browser motion updates instead of relying on 60 ms timing.

Travel screenshots are generated in `tests/travel-*.png`. Test tooling is optional and is not shipped as a runtime dependency.

## Preview

From the project directory, run `python -m http.server 4173`, then open http://localhost:4173.

## Features

- Original navy and cyan palette with translucent glass panels with responsive layouts and existing original photographs.
- Collection search, category filters, and browser-local favorites.
- Accessible native photo dialog with previous/next controls, arrow keys, Escape, and focus restoration.
- Camera-dial desktop navigation inspired by https://epochtales.com/, with a moving label drum, fixed center pointer, scroll snapping, wheel gestures, and keyboard controls.
- Bottom mobile camera lens with a rotating focus ring, six-section fan menu, scroll tracking, touch targets, keyboard controls, and outside-click dismissal.
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

Run `node tests/gallery-ui.cjs` to check gallery layout bounds at six viewport widths, selected shelf-card clipping, arrow alignment, Save/title overlap, preserved filter controls, empty-state keyboard focus, and share-link editing. It also captures mobile and desktop gallery screenshots in `tests/`.

## Travel interactions and shelf-frame checks

My Journey includes sticky chapter tracking, a reading-progress line, subtle story/map transitions, photo hover cues, and an original-image viewer with arrow keys, swipe navigation, Escape, and focus restoration. All effects respect Pause motion and system reduced motion. Run `node tests/travel-ui.cjs` to verify those interactions.

The gallery record shelf uses even, thin borders and separates neighboring sleeves from the selected frame. Run `node tests/shelf-frames.cjs` to verify selected-frame visibility, bounds, and symmetric borders at nine widths from 320px through 1920px.

The homepage Journey preview is generated from the same trip data, using `tools/travel-home-template.html`. Run `node tests/journey-home.cjs` to check the menu entry, preview layout, original section presence, and story links at nine screen widths.


## Search visibility and menu validation

My Journey is in both the desktop camera menu and mobile lens menu, between Stories and About. There is no standalone Journey link in the header.

The homepage includes a production canonical, descriptive title/description, Open Graph and Twitter cards, and factual Person/WebSite/WebPage JSON-LD. `robots.txt` permits crawling and advertises the XML sitemap. The sitemap includes the indexable homepage and 27 original photographs. Dummy destination names in the homepage preview are excluded from search snippets; the sample journal remains `noindex,follow` and is omitted from the sitemap.

After changing trip data, run `python tools/build-travel.py` followed by `python tools/build-seo.py`. Run both commands with `--check` to verify the committed output. When real travel content is ready, set `sample` to `false` and rebuild both: the journal then becomes indexable and enters the sitemap. No keywords stuffing, fabricated reviews, business addresses, trip dates, or ranking claims are added.

After publishing these files to Netlify, verify the deployed canonical URL, robots.txt and sitemap.xml. Verify ownership of `https://nydh.netlify.app/` in Google Search Console, submit `https://nydh.netlify.app/sitemap.xml`, and use URL Inspection to request indexing. Search Console ownership, live deployment, indexing, rich-result eligibility and rankings are not confirmed by local tests. Consistent real travel stories, descriptive original photographs and relevant links from your existing profiles support ongoing visibility.

References: [Google canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), and [robots/snippet controls](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag).

`node tests/menu-seo.cjs` checks the six menu entries at 11 viewport/landscape sizes, 44px touch targets, overlap, section tracking, titles/metadata, heading and ID integrity, structured data, robots.txt and image-sitemap responses. The rest of the existing browser suites cover gallery, stories, saved photos, blocked storage, motion, the travel viewer and no-JavaScript fallback.
