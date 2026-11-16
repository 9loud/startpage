import {icon} from './icons.js';

const PAGE_SIZE = 5;
const pageByCategory = new Map();
const STARRED_ID = '__starred';

/**
 * Filter chip bar. Rebuilds when the category list changes and keeps a single
 * selection.
 *
 * @param {HTMLElement} chipSet
 * @param {{onSelect: (mode: string) => void}} options
 */
export function createChips(chipSet, {onSelect}) {
  let signature = '';

  function build(state) {
    const nextSignature = state.categories
      .map((category) => `${category.id}:${category.title}`)
      .join('|');
    if (nextSignature === signature && chipSet.children.length) return;
    signature = nextSignature;

    chipSet.replaceChildren();

    const makeChip = (mode, label, selected) => {
      const chip = document.createElement('md-filter-chip');
      chip.dataset.mode = mode;
      chip.label = label;
      chip.selected = selected;
      chip.setAttribute('has-selected-icon', '');

      const check = document.createElement('md-icon');
      check.setAttribute('slot', 'selected-icon');
      check.innerHTML = icon('check', {size: 18});

      chip.append(check);
      chipSet.append(chip);
    };

    makeChip('all', 'All', true);
    makeChip('starred', 'Starred', false);
    for (const category of state.categories) {
      makeChip(category.id, category.title, false);
    }
  }

  chipSet.addEventListener('click', (event) => {
    const chip = event.target.closest('md-filter-chip');
    if (!chip || !chipSet.contains(chip)) return;
    onSelect(chip.dataset.mode ?? 'all');
  });

  return {
    render(state, filter) {
      build(state);
      for (const chip of chipSet.querySelectorAll('md-filter-chip')) {
        chip.selected = chip.dataset.mode === filter;
      }
    },
  };
}

function initial(name) {
  const value = String(name ?? '').trim();
  return value ? value[0].toUpperCase() : '•';
}

function toneFor(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 4;
  }
  return hash + 1;
}

/**
 * @param {HTMLElement} grid
 * @param {import('./store.js').StartPageState} state
 * @param {string} filter
 * @param {{
 *   onToggleStar: (categoryId: string, linkId: string) => void,
 *   onEmptyAction?: () => void,
 * }} options
 */
export function renderBookmarks(grid, state, filter, options) {
  grid.replaceChildren();

  let categories;
  if (filter === 'starred') {
    const seen = new Set();
    const links = [];
    for (const category of state.categories) {
      for (const link of category.links) {
        if (!link.starred || seen.has(link.url)) continue;
        seen.add(link.url);
        links.push(link);
      }
    }
    categories = links.length
      ? [{id: STARRED_ID, title: 'Starred', links}]
      : [];
  } else if (filter === 'all') {
    categories = state.categories;
  } else {
    categories = state.categories.filter((category) => category.id === filter);
  }

  if (categories.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = `<p class="md-body-large">${
      filter === 'starred'
        ? 'No starred links yet. Tap the star on any bookmark to pin it here.'
        : 'No bookmarks here yet.'
    }</p>`;
    grid.append(empty);
    return;
  }

  for (const category of categories) {
    grid.append(renderCard(category, state, options));
  }
}

function renderCard(category, state, {onToggleStar}) {
  const card = document.createElement('section');
  card.className = 'category-card';
  card.dataset.category = category.id;

  const head = document.createElement('header');
  head.className = 'category-card__head';

  const title = document.createElement('h2');
  title.className = 'category-card__title md-title-medium';
  title.textContent = category.title;
  head.append(title);
  card.append(head);

  const list = document.createElement('ul');
  list.className = 'link-list';
  list.setAttribute('role', 'list');

  const totalPages = Math.max(1, Math.ceil(category.links.length / PAGE_SIZE));
  const currentPage = Math.min(
    pageByCategory.get(category.id) ?? 0,
    totalPages - 1,
  );
  pageByCategory.set(category.id, currentPage);

  const start = currentPage * PAGE_SIZE;
  const visible = category.links.slice(start, start + PAGE_SIZE);

  if (visible.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'category-card__empty md-body-small';
    empty.textContent = 'No links in this category.';
    list.append(empty);
  }

  for (const link of visible) {
    list.append(renderRow(category, link, onToggleStar));
  }
  card.append(list);

  if (totalPages > 1) {
    const footer = document.createElement('footer');
    footer.className = 'category-card__footer';

    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'pager-button';
    prev.dataset.dir = '-1';
    prev.setAttribute('aria-label', `Previous page of ${category.title}`);
    prev.disabled = currentPage === 0;
    prev.innerHTML = icon('chevron_left', {size: 18});

    const label = document.createElement('span');
    label.className = 'pager-label md-label-medium';
    label.textContent = `${currentPage + 1} / ${totalPages}`;

    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'pager-button';
    next.dataset.dir = '1';
    next.setAttribute('aria-label', `Next page of ${category.title}`);
    next.disabled = currentPage >= totalPages - 1;
    next.innerHTML = icon('chevron_right', {size: 18});

    footer.append(prev, label, next);
    card.append(footer);

    footer.addEventListener('click', (event) => {
      const button = event.target.closest('.pager-button');
      if (!button) return;
      const direction = Number(button.dataset.dir);
      const target = currentPage + direction;
      if (target < 0 || target >= totalPages) return;
      pageByCategory.set(category.id, target);

      const grid = card.parentElement;
      if (!grid) return;
      renderBookmarks(grid, state, getFilterFromChips(grid), {onToggleStar});
      const moved = grid.querySelector(
        `[data-category="${category.id}"] .pager-button[data-dir="${direction}"]`,
      );
      moved?.focus();
    });
  }

  return card;
}

function getFilterFromChips(grid) {
  const chipSet = document.getElementById('bookmark-filters');
  if (!chipSet) return 'all';
  const selected = chipSet.querySelector('md-filter-chip[selected]');
  return selected?.dataset.mode ?? 'all';
}

function renderRow(category, link, onToggleStar) {
  const item = document.createElement('li');
  item.className = 'link-row';
  item.dataset.link = link.id;

  const anchor = document.createElement('a');
  anchor.className = 'link-row__main';
  anchor.href = link.url;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  anchor.title = link.url;

  const badge = document.createElement('span');
  badge.className = `link-row__badge tone-${toneFor(link.url)}`;
  badge.textContent = initial(link.text || link.url);
  badge.setAttribute('aria-hidden', 'true');

  const text = document.createElement('span');
  text.className = 'link-row__text md-body-medium';
  text.textContent = link.text || link.url;

  const external = document.createElement('span');
  external.className = 'link-row__external';
  external.innerHTML = icon('open_in_new', {size: 14});

  anchor.append(badge, text, external);

  const star = document.createElement('button');
  star.type = 'button';
  star.className = `link-row__star${link.starred ? ' is-starred' : ''}`;
  star.dataset.star = link.id;
  star.setAttribute('aria-pressed', String(link.starred));
  star.setAttribute(
    'aria-label',
    `${link.starred ? 'Unstar' : 'Star'} ${link.text || link.url}`,
  );
  star.innerHTML = icon(link.starred ? 'star' : 'star_border', {size: 18});

  star.addEventListener('click', () => {
    onToggleStar(category.id, link.id);
    requestAnimationFrame(() => {
      document
        .querySelector(
          `.link-row__star[data-star="${CSS.escape(link.id)}"]`,
        )
        ?.focus();
    });
  });

  item.append(anchor, star);
  return item;
}
