import {createChips, renderBookmarks} from './bookmarks.js';
import {icon, hydrateIcons} from './icons.js';
import {loadHeroImage} from './media.js';
import {createSearch} from './search.js';
import {
  createConfirm,
  createSettings,
  createSnackbar,
} from './settings.js';
import {loadState, normalize, saveState} from './store.js';
import {resolveTheme} from './themes.js';

const state = loadState();

const root = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const settingsButton = document.getElementById('settings-button');
const settingsDialog = document.getElementById('settings-dialog');
const settingsTabs = document.getElementById('settings-tabs');
const confirmDialog = document.getElementById('confirm-dialog');
const snackbarElement = document.getElementById('snackbar');
const grid = document.getElementById('bookmarks');
const chipSet = document.getElementById('bookmark-filters');
const clockTime = document.getElementById('clock-time');
const clockDate = document.getElementById('clock-date');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const suggestions = document.getElementById('search-suggestions');
const addFab = document.getElementById('add-link-fab');

const lightPreference = window.matchMedia('(prefers-color-scheme: light)');
let filter = 'all';

hydrateIcons(document);

const snackbar = createSnackbar(snackbarElement);
const confirm = createConfirm(confirmDialog);

function applyTheme(setting = state.settings.theme) {
  const resolved = resolveTheme(setting, lightPreference.matches);
  root.dataset.theme = resolved.id;
  root.dataset.colorMode = resolved.mode;

  const nextTheme = resolved.mode === 'dark' ? 'light' : 'dark';
  const iconName = nextTheme === 'light' ? 'light_mode' : 'dark_mode';
  const label = `Switch to ${nextTheme} theme`;

  const glyph = themeToggle.querySelector('md-icon');
  if (glyph) glyph.innerHTML = icon(iconName);
  themeToggle.setAttribute('aria-label', label);
  themeToggle.title = label;

  const surface = getComputedStyle(root)
    .getPropertyValue('--md-sys-color-surface')
    .trim();
  if (surface) {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.append(meta);
    }
    meta.setAttribute('content', surface);
  }
}

function toggleTheme() {
  const {mode} = resolveTheme(state.settings.theme, lightPreference.matches);
  const next = mode === 'dark' ? 'light' : 'dark';
  // normalize() also derives settings.colorMode, which the pre-paint script reads.
  state.settings = normalize({
    settings: {...state.settings, theme: next},
  }).settings;
  saveState(state);
  applyTheme();
}

const DEFAULT_HERO_ALT =
  'A person sitting at a desk, petting a cat in front of a computer.';

const heroImage = document.getElementById('hero-image');
const heroCaption = document.getElementById('hero-caption');
let heroSrc = 'cat.gif';
let heroObjectUrl = '';
let heroToken = 0;

function releaseHeroUrl() {
  if (!heroObjectUrl) return;
  URL.revokeObjectURL(heroObjectUrl);
  heroObjectUrl = '';
}

function showHero(src, caption, alt) {
  heroSrc = src;
  heroImage.alt = alt;
  heroImage.src = src;
  heroCaption.textContent = caption;
}

/** Applies settings.hero: default cat.gif, a linked image, or an upload. */
async function applyHero() {
  const token = ++heroToken;
  const hero = state.settings.hero;

  if (hero.type === 'upload') {
    const blob = await loadHeroImage();
    if (token !== heroToken) return;
    if (blob) {
      releaseHeroUrl();
      heroObjectUrl = URL.createObjectURL(blob);
      showHero(heroObjectUrl, `~/${hero.name || 'artwork'}`, 'Custom artwork');
      return;
    }
  }

  if (hero.type === 'url' && hero.url) {
    releaseHeroUrl();
    showHero(hero.url, `~/${hero.name || 'linked image'}`, 'Custom artwork');
    return;
  }

  releaseHeroUrl();
  showHero('cat.gif', '~/cat.gif', DEFAULT_HERO_ALT);
}

/** Persists an artwork choice and re-renders it immediately. */
async function setHero(hero) {
  state.settings = normalize({
    settings: {...state.settings, hero},
  }).settings;
  saveState(state);
  await applyHero();
}

heroImage.addEventListener('error', () => {
  if (heroSrc === 'cat.gif') return;
  releaseHeroUrl();
  showHero('cat.gif', '~/cat.gif (image unavailable)', DEFAULT_HERO_ALT);
});

function pad(value) {
  return String(value).padStart(2, '0');
}

function tick() {
  const now = new Date();

  const hours24 = now.getHours();
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  const hours = hours24 % 12 || 12;
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());

  clockTime.textContent = state.settings.showSeconds
    ? `${pad(hours)}:${minutes}:${seconds} ${ampm}`
    : `${pad(hours)}:${minutes} ${ampm}`;

  clockDate.textContent = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function openUrl(url) {
  window.open(url, '_blank', 'noopener,noreferrer');
}

const search = createSearch({
  form: searchForm,
  input: searchInput,
  panel: suggestions,
  getState: () => state,
  openUrl,
});

const chips = createChips(chipSet, {
  onSelect(mode) {
    filter = mode;
    chips.render(state, filter);
    renderAll();
  },
});

function currentFilterIsValid() {
  if (filter === 'all' || filter === 'starred') return true;
  return state.categories.some((category) => category.id === filter);
}

function renderAll() {
  if (!currentFilterIsValid()) filter = 'all';
  chips.render(state, filter);
  renderBookmarks(grid, state, filter, {
    onToggleStar(_categoryId, linkId) {
      for (const category of state.categories) {
        const link = category.links.find((item) => item.id === linkId);
        if (!link) continue;
        link.starred = !link.starred;
        saveState(state);
        break;
      }
      renderAll();
    },
  });
}

const settings = createSettings({
  dialog: settingsDialog,
  tabs: settingsTabs,
  getState: () => state,
  onSave(next) {
    Object.assign(state, next);
    saveState(state);
    applyTheme();
    tick();
    renderAll();
    applyHero();
  },
  confirm,
  toast: (message, options) => snackbar.show(message, options),
  previewTheme: (theme) => applyTheme(theme),
  endThemePreview: () => applyTheme(),
  getHeroSrc: () => heroSrc,
  onHeroChange: (hero) => setHero(hero),
});

themeToggle.addEventListener('click', toggleTheme);
settingsButton.addEventListener('click', () => settings.open(0));
addFab.addEventListener('click', () => settings.open(0, {newLink: true}));

lightPreference.addEventListener('change', () => {
  if (state.settings.theme === 'system') applyTheme();
});

document.addEventListener('keydown', (event) => {
  const active = document.activeElement;
  const typing =
    active instanceof HTMLElement &&
    (active.matches('input, textarea, select') || active.isContentEditable);
  const meta = event.ctrlKey || event.metaKey;
  const dialogOpen = Boolean(document.querySelector('md-dialog[open]'));

  if (meta && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    search.focus();
    return;
  }

  if (meta && event.key === ',') {
    event.preventDefault();
    settings.open(0);
    return;
  }

  if (dialogOpen || typing || meta || event.altKey) return;

  if (event.key === '/') {
    event.preventDefault();
    search.focus();
  } else if (event.key.toLowerCase() === 't') {
    toggleTheme();
  }
});

applyTheme();
tick();
window.setInterval(tick, 1000);
renderAll();
applyHero();

if (window.matchMedia('(pointer: fine)').matches && window.innerWidth >= 900) {
  searchInput.focus({preventScroll: true});
}
