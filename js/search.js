import {SEARCH_ENGINES} from './defaults.js';
import {icon} from './icons.js';

const MAX_SUGGESTIONS = 6;

/** @param {string} value */
export function isProbablyUrl(value) {
  const text = value.trim();
  if (!text || /\s/.test(text)) return false;
  if (/^https?:\/\//i.test(text)) return true;
  if (/^localhost(:\d+)?([/?#].*)?$/i.test(text)) return true;
  if (/^\d{1,3}(\.\d{1,3}){3}(:\d+)?([/?#].*)?$/.test(text)) return true;
  return (
    /^[\w-]+(\.[\w-]+)+(:\d+)?([/?#].*)?$/i.test(text) &&
    /\.[a-z]{2,}(?:[:/?#]|$)/i.test(text)
  );
}

/** @param {string} value */
export function normalizeUrl(value) {
  const text = value.trim();
  if (/^[a-z][a-z0-9+.-]*:/i.test(text)) return text;
  return `https://${text}`;
}

export function searchUrl(engine, query) {
  const config = SEARCH_ENGINES[engine] ?? SEARCH_ENGINES.duckduckgo;
  return config.url + encodeURIComponent(query);
}

/**
 * Wires the M3 search bar: URL detection, local bookmark suggestions and
 * keyboard navigation.
 *
 * @param {{
 *   form: HTMLFormElement,
 *   input: HTMLInputElement,
 *   panel: HTMLElement,
 *   getState: () => import('./store.js').StartPageState,
 *   openUrl: (url: string) => void,
 * }} options
 */
export function createSearch({form, input, panel, getState, openUrl}) {
  /** @type {Array<{type: 'web'|'link', label: string, sub: string, url: string}>} */
  let rows = [];
  let activeIndex = -1;

  function collectMatches(query) {
    const needle = query.toLowerCase();
    const state = getState();
    /** @type {Array<{link: any, category: string, score: number}>} */
    const matches = [];

    for (const category of state.categories) {
      for (const link of category.links) {
        const text = link.text.toLowerCase();
        const url = link.url.toLowerCase();
        let score = -1;
        if (text.startsWith(needle)) score = 0;
        else if (text.includes(needle)) score = 1;
        else if (url.includes(needle)) score = 2;
        else if (category.title.toLowerCase().includes(needle)) score = 3;
        if (score >= 0) {
          matches.push({link, category: category.title, score});
        }
      }
    }

    matches.sort(
      (a, b) =>
        a.score - b.score || a.link.text.localeCompare(b.link.text, 'en'),
    );

    const seen = new Set();
    return matches
      .filter(({link}) => {
        if (seen.has(link.url)) return false;
        seen.add(link.url);
        return true;
      })
      .slice(0, MAX_SUGGESTIONS);
  }

  function buildRows(query) {
    const state = getState();
    const engineName =
      SEARCH_ENGINES[state.settings.searchEngine]?.label ?? 'DuckDuckGo';
    return [
      {
        type: 'web',
        label: `Search ${engineName} for “${query}”`,
        sub: 'Web',
        url: searchUrl(state.settings.searchEngine, query),
      },
      ...collectMatches(query).map(({link, category}) => ({
        type: 'link',
        label: link.text || link.url,
        sub: category,
        url: link.url,
      })),
    ];
  }

  function render(query) {
    panel.replaceChildren();

    if (!query.trim()) {
      close();
      return;
    }

    rows = buildRows(query.trim());
    activeIndex = -1;

    rows.forEach((row, index) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'suggestion';
      item.id = `search-option-${index}`;
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', 'false');
      item.dataset.index = String(index);

      const glyph = document.createElement('span');
      glyph.className = 'suggestion__icon';
      glyph.innerHTML = icon(row.type === 'web' ? 'search' : 'open_in_new', {
        size: 20,
      });

      const label = document.createElement('span');
      label.className = 'suggestion__label';
      label.textContent = row.label;

      const sub = document.createElement('span');
      sub.className = 'suggestion__sub';
      sub.textContent = row.sub;

      item.append(glyph, label, sub);
      panel.append(item);
    });

    panel.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }

  function setActive(index, scroll = false) {
    activeIndex = index;
    const items = panel.querySelectorAll('.suggestion');
    items.forEach((item, i) => {
      item.setAttribute('aria-selected', String(i === index));
    });
    if (index >= 0) {
      input.setAttribute('aria-activedescendant', `search-option-${index}`);
      if (scroll) {
        items[index]?.scrollIntoView({block: 'nearest'});
      }
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  }

  function close() {
    panel.hidden = true;
    panel.replaceChildren();
    rows = [];
    activeIndex = -1;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
  }

  function choose(index) {
    const row = rows[index];
    if (!row) return;

    if (row.type === 'link') {
      openUrl(row.url);
    } else {
      const query = input.value.trim();
      openUrl(searchUrl(getState().settings.searchEngine, query));
    }

    close();
    input.value = '';
    input.blur();
  }

  function submit() {
    if (activeIndex >= 0) {
      choose(activeIndex);
      return;
    }
    const query = input.value.trim();
    if (!query) return;
    if (isProbablyUrl(query)) {
      openUrl(normalizeUrl(query));
    } else {
      openUrl(searchUrl(getState().settings.searchEngine, query));
    }
    close();
    input.value = '';
  }

  input.addEventListener('input', () => render(input.value));
  input.addEventListener('focus', () => {
    if (input.value.trim()) render(input.value);
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (panel.hidden) {
        render(input.value);
        return;
      }
      const next = activeIndex + 1 >= rows.length ? 0 : activeIndex + 1;
      setActive(next, true);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (panel.hidden) return;
      const prev = activeIndex - 1 < 0 ? rows.length - 1 : activeIndex - 1;
      setActive(prev, true);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      submit();
    } else if (event.key === 'Escape') {
      if (!panel.hidden) {
        event.preventDefault();
        close();
      } else if (input.value) {
        input.value = '';
      }
    } else if (event.key === 'Tab') {
      close();
    }
  });

  panel.addEventListener('mousedown', (event) => {
    // Keep focus in the input while clicking a suggestion.
    event.preventDefault();
  });

  panel.addEventListener('click', (event) => {
    const item = event.target.closest('.suggestion');
    if (!item) return;
    choose(Number(item.dataset.index));
  });

  panel.addEventListener('mousemove', (event) => {
    const item = event.target.closest('.suggestion');
    if (!item) return;
    const index = Number(item.dataset.index);
    if (index !== activeIndex) setActive(index);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    submit();
  });

  document.addEventListener('pointerdown', (event) => {
    if (!panel.hidden && !form.contains(event.target)) {
      close();
    }
  });

  document.addEventListener('focusin', (event) => {
    if (!panel.hidden && !form.contains(event.target)) {
      close();
    }
  });

  return {focus: () => input.focus(), close};
}
