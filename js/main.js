import {createChips, renderBookmarks} from './bookmarks.js';
import {icon, hydrateIcons} from './icons.js';
import {createSearch} from './search.js';
import {
  createConfirm,
  createSettings,
  createSnackbar,
} from './settings.js';
import {loadState, saveState} from './store.js';

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

function resolvedTheme() {
  if (state.settings.theme === 'system') {
    return lightPreference.matches ? 'light' : 'dark';
  }
  return state.settings.theme;
}

function applyTheme() {
  const resolved = resolvedTheme();
  root.dataset.theme = resolved;

  const nextTheme = resolved === 'dark' ? 'light' : 'dark';
  const iconName = nextTheme === 'light' ? 'light_mode' : 'dark_mode';
  const label = `Switch to ${nextTheme} theme`;

  const glyph = themeToggle.querySelector('md-icon');
  if (glyph) glyph.innerHTML = icon(iconName);
  themeToggle.setAttribute('aria-label', label);
  themeToggle.title = label;
}

function toggleTheme() {
  const next = resolvedTheme() === 'dark' ? 'light' : 'dark';
  state.settings.theme = next;
  saveState(state);
  applyTheme();
}

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
  },
  confirm,
  toast: (message, options) => snackbar.show(message, options),
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

if (window.matchMedia('(pointer: fine)').matches && window.innerWidth >= 900) {
  searchInput.focus({preventScroll: true});
}
