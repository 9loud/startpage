import {DEFAULT_SETTINGS, createDefaultCategories} from './defaults.js';

export const STORAGE_KEY = 'startpage.data.v2';
export const LEGACY_KEY = 'bookmarksData';

/** @typedef {{id: string, text: string, url: string, starred: boolean}} Link */
/** @typedef {{id: string, title: string, links: Link[]}} Category */
/** @typedef {{theme: 'dark'|'light'|'system', searchEngine: string, showSeconds: boolean}} Settings */
/** @typedef {{version: 2, settings: Settings, categories: Category[]}} StartPageState */

export function uid(prefix = 'id') {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

/** Accepts bare domains, rejects javascript:/data: and other unsafe schemes. */
export function safeUrl(input) {
  const value = String(input ?? '').trim();
  if (!value || value === '#') return '';
  const scheme = value.match(/^([a-z][a-z0-9+.-]*):/i);
  if (scheme) {
    const name = scheme[1].toLowerCase();
    return name === 'http' || name === 'https' || name === 'mailto'
      ? value
      : '';
  }
  return `https://${value.replace(/^\/+/, '')}`;
}

function normalizeLink(raw) {
  const text = String(raw?.text ?? '').trim();
  const url = safeUrl(raw?.url);
  return {
    id: typeof raw?.id === 'string' && raw.id ? raw.id : uid('link'),
    text,
    url,
    starred: Boolean(raw?.starred),
  };
}

function normalizeCategory(raw) {
  return {
    id: typeof raw?.id === 'string' && raw.id ? raw.id : uid('cat'),
    title: String(raw?.title ?? 'Untitled').trim() || 'Untitled',
    links: Array.isArray(raw?.links)
      ? raw.links.map(normalizeLink).filter((link) => link.url)
      : [],
  };
}

/** @returns {StartPageState} */
export function normalize(raw) {
  const settings = {
    ...DEFAULT_SETTINGS,
    ...(raw?.settings && typeof raw.settings === 'object' ? raw.settings : {}),
  };
  if (!['dark', 'light', 'system'].includes(settings.theme)) {
    settings.theme = DEFAULT_SETTINGS.theme;
  }
  if (!['duckduckgo', 'google', 'yandex', 'bing'].includes(settings.searchEngine)) {
    settings.searchEngine = DEFAULT_SETTINGS.searchEngine;
  }
  settings.showSeconds = Boolean(settings.showSeconds);

  const categories = Array.isArray(raw?.categories)
    ? raw.categories.map(normalizeCategory)
    : [];

  return {version: 2, settings, categories};
}

function read(key) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function defaultsState() {
  return normalize({
    settings: DEFAULT_SETTINGS,
    categories: createDefaultCategories(),
  });
}

/** @returns {StartPageState} */
export function loadState() {
  const stored = read(STORAGE_KEY);
  if (stored) {
    return normalize(stored);
  }

  // Migrate the original array-shaped bookmarksData store.
  const legacy = read(LEGACY_KEY);
  if (Array.isArray(legacy)) {
    const migrated = normalize({categories: legacy});
    saveState(migrated);
    return migrated;
  }

  if (legacy && Array.isArray(legacy.categories)) {
    const migrated = normalize(legacy);
    saveState(migrated);
    return migrated;
  }

  return defaultsState();
}

/** @param {StartPageState} state */
export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.warn('[store] Unable to persist state', error);
    return false;
  }
}

export function freshState() {
  return defaultsState();
}

/** @param {string} text */
export function parseImport(text) {
  let raw;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('The file is not valid JSON.');
  }
  if (Array.isArray(raw)) {
    raw = {categories: raw};
  }
  if (!raw || !Array.isArray(raw.categories)) {
    throw new Error('No "categories" array found in the file.');
  }
  const state = normalize(raw);
  if (state.categories.length === 0) {
    throw new Error('The file does not contain any categories.');
  }
  return state;
}

export function exportState(state) {
  return JSON.stringify(
    {
      version: 2,
      exportedAt: new Date().toISOString(),
      settings: state.settings,
      categories: state.categories,
    },
    null,
    2,
  );
}
