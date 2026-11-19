# startpage

A Material 3 browser start page: clock, search with local suggestions, and a
paged, starred bookmark board. Dark by default, light on demand, and everything
lives in the browser — no account, no backend.

Live at **https://9loud.github.io/startpage/**

## Features

- **Search bar** — URL detection (`example.com`, `localhost:3000`) plus six
  inline suggestions from your own bookmarks. Keyboard-first: `↑`/`↓`, `Enter`,
  `Esc`.
- **Clock** — 12-hour time, `en-US` date, optional seconds.
- **Bookmarks** — categories rendered as cards, five links per page with
  pagination, a one-tap star, and `All` / `Starred` / per-category filter chips.
- **Full-screen settings** — add, edit, delete, star and reorder links and
  categories. Nothing is committed until you press **Save**.
- **Themes** — 40 curated palettes plus the built-in dark, light and
  system-following defaults. Picking a theme previews it live; cancel restores
  the previous one. The saved choice is applied before first paint, so there is
  no flash.
- **Artwork** — replace the cat GIF with any image or animated GIF, either from
  your disk (stored in this browser) or from a URL. **Use default** brings the
  cat back.
- **Appearance** — per-theme previews, DuckDuckGo, Google, Yandex, or Bing
  search engine, seconds on/off.
- **Data** — export/import the bookmark set as JSON, or reset to defaults.
- **Shortcuts** — `Ctrl`/`Cmd` + `K` or `/` focuses search, `Ctrl`/`Cmd` + `,`
  opens settings, `T` toggles the theme.
- **Responsive** — two columns on desktop, single column with a bottom FAB on
  phones.

## Material 3

The UI is built on [`@material/web`](https://github.com/material-components/material-web)
2.5 components (tabs, dialogs, text fields, chips, switches, buttons, FAB,
icons) plus a few custom pieces (the search surface, cards, snackbar, category
board, theme tiles, and the loading-indicator-style AI shortcuts) styled from
the same tokens.

- `css/tokens.css` — color roles for the built-in light and dark themes,
  generated from a gruvbox-inspired seed palette (`#fe8019`, `#83a598`,
  `#d3869b`, `#8a7f74`) at build time.
- `css/themes.css` — generated color roles for the 40 alternate themes. Each
  palette lists six colours; `tools/build.mjs` expands them into the full M3
  role set (surfaces, containers, outlines, accents) so every component themes
  consistently.
- `css/sys.css` — shape, elevation, motion, state, and type-scale tokens.
- `vendor/material.js` — the component bundle (Material Web + Lit), committed so
  the page has **no runtime CDN dependency**.
- `assets/fonts/` — self-hosted Roboto (latin, latin-ext, cyrillic subsets).
- Icons are inline SVG inside `<md-icon>`; no icon font is loaded.

## Development

Requires Node.js 18+.

```sh
cd tools
npm install
node build.mjs     # regenerates css/tokens.css, css/themes.css, vendor/material.js
node serve.mjs     # http://localhost:8080/
```

`build.mjs` is only needed when you change the seed palette, the alternate
themes, or the set of imported Material components (`tools/vendor-entry.js`).
Application CSS and JS are plain static files — edit and refresh.

### Visual regression pass

```sh
cd tools
npm install
node qa.mjs
```

The script drives Microsoft Edge via `playwright-core` (the executable path is
at the top of `qa.mjs`), checks rendering, search, settings, themes, artwork,
starring, persistence, import/export, and the mobile layout, and writes
screenshots to your temp folder. Change `EDGE` if Edge is installed elsewhere.

## Customizing

- **Built-in colors** — edit `SEEDS` in `tools/build.mjs`, then `node build.mjs`.
- **Alternate themes** — add a six-color entry to `js/themes.js` and rebuild;
  the settings picker and `css/themes.css` update together.
- **Default bookmarks and search engines** — `js/defaults.js`.
- **Layout and component styling** — `css/app.css`.
- **Icons** — add a 24 × 24 path to `js/icons.js`.
- **Material components in the bundle** — `tools/vendor-entry.js`.

## Data and storage

State is stored in `localStorage` under `startpage.data.v2`. On first run the
old array-shaped `bookmarksData` key from the previous version is migrated
automatically. Use **Settings → Data → Export JSON** to back up or move the
bookmark set; import accepts either the exported object or a bare array of
categories.

Uploaded artwork is kept separately in IndexedDB (`startpage.media` →
`assets` → `hero`) because images and GIFs are larger than `localStorage`
allows. Uploads apply immediately, are limited to 24 MB, and never leave the
browser; JSON exports intentionally omit them. Linked images are stored as a URL
in `settings.hero` and are fetched by the browser on load.

## Project layout

```
index.html          page shell and dialogs
css/                fonts, generated tokens and themes, system tokens, app styles
js/                 bootstrap, search, bookmarks, settings, store, themes, media, icons
vendor/material.js  bundled Material Web components
assets/fonts/       self-hosted Roboto subsets
tools/              esbuild bundle + token/theme generator, dev server, QA script
```

## Credits

- Original start page and bookmark set: [NajmosSalahin](https://github.com/NajmosSalahin/startpage)
- Theme palettes: [Zenith Tracker](https://github.com/NajmosSalahin/Zenith_Tracker), MIT
- Cat GIF: [@avogado6](https://twitter.com/avogado6/status/1165595520967954432)
- Material Web: Google, Apache-2.0
- MIT licensed — see [LICENSE](LICENSE).
