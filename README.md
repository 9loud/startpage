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
- **Settings dialog** — add, edit, delete, star and reorder links and
  categories. Nothing is committed until you press **Save**.
- **Appearance** — dark, light, or system theme; DuckDuckGo, Google, Yandex, or
  Bing search engine; seconds on/off. The theme choice is applied before first
  paint, so there is no flash.
- **Data** — export/import the bookmark set as JSON, or reset to defaults.
- **Shortcuts** — `Ctrl`/`Cmd` + `K` or `/` focuses search, `Ctrl`/`Cmd` + `,`
  opens settings, `T` toggles the theme.
- **Responsive** — two columns on desktop, single column with a bottom FAB on
  phones.

## Material 3

The UI is built on [`@material/web`](https://github.com/material-components/material-web)
2.5 components (tabs, dialogs, text fields, chips, switches, radios, buttons,
FAB, icons) plus a few custom pieces (the search surface, cards, snackbar, and
category board) styled from the same tokens.

- `css/tokens.css` — color roles for light and dark, generated from a
  gruvbox-inspired seed palette (`#fe8019`, `#83a598`, `#d3869b`, `#8a7f74`) at
  build time.
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
node build.mjs     # regenerates css/tokens.css and vendor/material.js
node serve.mjs     # http://localhost:8080/
```

`build.mjs` is only needed when you change the seed palette or the set of
imported Material components (`tools/vendor-entry.js`). Application CSS and JS
are plain static files — edit and refresh.

### Visual regression pass

```sh
cd tools
npm install
node qa.mjs
```

The script drives Microsoft Edge via `playwright-core` (the executable path is
at the top of `qa.mjs`), checks rendering, search, settings, starring,
persistence, theming, and the mobile layout, and writes screenshots to your temp
folder. Change `EDGE` if Edge is installed elsewhere.

## Customizing

- **Colors** — edit `SEEDS` in `tools/build.mjs`, then `node build.mjs`.
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

## Project layout

```
index.html          page shell and dialogs
css/                fonts, generated tokens, system tokens, app styles
js/                 bootstrap, search, bookmarks, settings, store, icons
vendor/material.js  bundled Material Web components
assets/fonts/       self-hosted Roboto subsets
tools/              esbuild bundle + token generator, dev server, QA script
```

## Credits

- Original start page and bookmark set: [NajmosSalahin](https://github.com/NajmosSalahin/startpage)
- Cat GIF: [@avogado6](https://twitter.com/avogado6/status/1165595520967954432)
- Material Web: Google, Apache-2.0
- MIT licensed — see [LICENSE](LICENSE).
