import {SEARCH_ENGINES} from './defaults.js';
import {icon} from './icons.js';
import {
  exportState,
  freshState,
  normalize,
  parseImport,
  safeUrl,
  uid,
} from './store.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function textField(label, value, type = 'text') {
  const field = document.createElement('md-outlined-text-field');
  field.setAttribute('label', label);
  field.type = type;
  field.value = value ?? '';
  return field;
}

function iconButton(name, label, onClick) {
  const button = document.createElement('md-icon-button');
  button.setAttribute('aria-label', label);
  button.title = label;
  button.innerHTML = `<md-icon>${icon(name)}</md-icon>`;
  if (onClick) button.addEventListener('click', onClick);
  return button;
}

function textButton(name, label, onClick) {
  const button = document.createElement('md-text-button');
  button.innerHTML = `<md-icon slot="icon">${icon(name, {
    size: 18,
  })}</md-icon>${label}`;
  button.addEventListener('click', onClick);
  return button;
}

/**
 * M3 confirmation dialog. Returns an async ask() helper.
 * @param {HTMLElement & {show: Function, close: Function}} dialog
 */
export function createConfirm(dialog) {
  const title = dialog.querySelector('[data-confirm-title]');
  const message = dialog.querySelector('[data-confirm-message]');
  const ok = dialog.querySelector('[data-confirm-ok]');
  const cancel = dialog.querySelector('[data-confirm-cancel]');
  let resolveCurrent = null;

  function settle(value) {
    if (!resolveCurrent) return;
    const resolve = resolveCurrent;
    resolveCurrent = null;
    resolve(value);
  }

  ok.addEventListener('click', () => {
    settle(true);
    dialog.close();
  });
  cancel.addEventListener('click', () => {
    settle(false);
    dialog.close();
  });
  dialog.addEventListener('close', () => settle(false));

  return function ask({
    titleText = 'Are you sure?',
    messageText = '',
    confirmLabel = 'Delete',
    danger = true,
  } = {}) {
    if (dialog.open) return Promise.resolve(false);
    if (title) title.textContent = titleText;
    if (message) message.textContent = messageText;
    ok.textContent = confirmLabel;
    ok.classList.toggle('danger', danger);
    cancel.textContent = 'Cancel';
    dialog.show();
    return new Promise((resolve) => {
      resolveCurrent = resolve;
    });
  };
}

/** Lightweight M3 snackbar with an optional action. */
export function createSnackbar(element) {
  let timeout = 0;

  function hide() {
    element.classList.remove('show');
    window.clearTimeout(timeout);
  }

  return {
    show(message, {actionLabel, onAction, duration = 3600} = {}) {
      element.replaceChildren();

      const label = el('span', 'snackbar__label md-body-medium', message);
      element.append(label);

      if (actionLabel) {
        const action = el('button', 'snackbar__action md-label-large', actionLabel);
        action.type = 'button';
        action.addEventListener('click', () => {
          onAction?.();
          hide();
        });
        element.append(action);
      }

      element.classList.add('show');
      window.clearTimeout(timeout);
      timeout = window.setTimeout(hide, duration);
    },
    hide,
  };
}

/**
 * Settings dialog with three sections: bookmarks, appearance and data.
 *
 * @param {{
 *   dialog: any,
 *   tabs: any,
 *   getState: () => import('./store.js').StartPageState,
 *   onSave: (state: import('./store.js').StartPageState) => void,
 *   confirm: (options: object) => Promise<boolean>,
 *   toast: (message: string, options?: object) => void,
 * }} options
 */
export function createSettings({dialog, tabs, getState, onSave, confirm, toast}) {
  const panel = dialog.querySelector('[data-settings-content]');
  const cancelButton = dialog.querySelector('[data-settings-cancel]');
  const saveButton = dialog.querySelector('[data-settings-save]');

  /** @type {import('./store.js').StartPageState | null} */
  let draft = null;
  let activeTab = 0;

  const sections = document.createElement('div');
  sections.className = 'settings-panels';

  const bookmarksPanel = el('section', 'settings-panel');
  bookmarksPanel.dataset.panel = '0';
  const appearancePanel = el('section', 'settings-panel');
  appearancePanel.dataset.panel = '1';
  const dataPanel = el('section', 'settings-panel');
  dataPanel.dataset.panel = '2';
  sections.append(bookmarksPanel, appearancePanel, dataPanel);

  panel.replaceChildren(tabs, sections);

  const categoriesMount = el('div', 'settings-categories');
  const addCategoryRow = el('div', 'settings-add-row');
  bookmarksPanel.append(
    el(
      'p',
      'settings-hint md-body-small',
      'Reorder links with the arrows. Changes apply on Save.',
    ),
    categoriesMount,
    addCategoryRow,
  );
  addCategoryRow.append(
    textButton('add', 'Add category', () => {
      if (!draft) return;
      const category = {
        id: uid('cat'),
        title: 'New category',
        links: [],
      };
      draft.categories.push(category);
      renderCategories();
      focusAfterRender(
        `.settings-category[data-category="${CSS.escape(category.id)}"] md-outlined-text-field`,
        {scroll: true},
      );
    }),
  );

  const dataDescription = el(
    'p',
    'settings-hint md-body-small',
    'Bookmarks are stored in this browser (localStorage). Export a JSON copy to move them to another device or origin.',
  );
  const dataActions = el('div', 'settings-data-actions');
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'application/json,.json';
  fileInput.hidden = true;
  dataPanel.append(dataDescription, dataActions, fileInput);
  let importedNotice = '';

  dataActions.append(
    textButton('download', 'Export JSON', () => exportData()),
    textButton('upload', 'Import JSON', () => fileInput.click()),
    textButton('restart', 'Reset to defaults', () => resetData()),
  );
  dataActions.lastElementChild?.style.setProperty(
    '--md-text-button-label-text-color',
    'var(--md-sys-color-error)',
  );

  tabs.addEventListener('change', () => {
    activeTab = tabs.activeTabIndex ?? 0;
    syncPanels();
  });

  cancelButton.addEventListener('click', () => dialog.close());
  saveButton.addEventListener('click', () => commit());

  dialog.addEventListener('close', () => {
    draft = null;
  });

  function syncPanels() {
    for (const section of sections.querySelectorAll('.settings-panel')) {
      section.hidden = Number(section.dataset.panel) !== activeTab;
    }
  }

  /** @param {import('./store.js').StartPageState} state */
  function clone(state) {
    return JSON.parse(JSON.stringify(state));
  }

  function renderCategories() {
    if (!draft) return;
    categoriesMount.replaceChildren();

    if (draft.categories.length === 0) {
      const empty = el(
        'p',
        'settings-empty md-body-medium',
        'No categories yet. Add one to get started.',
      );
      categoriesMount.append(empty);
      return;
    }

    draft.categories.forEach((category, categoryIndex) => {
      categoriesMount.append(renderCategory(category, categoryIndex));
    });
  }

  /**
   * Restores focus after a re-render (the fields are rebuilt). Keeps keyboard
   * and screen-reader users on the row they were editing.
   */
  function focusAfterRender(selector, {scroll = false} = {}) {
    requestAnimationFrame(() => {
      const element = panel.querySelector(selector);
      if (!element) return;
      if (scroll) element.scrollIntoView({block: 'center'});
      element.focus();
    });
  }

  function renderCategory(category, categoryIndex) {
    const block = el('div', 'settings-category');
    block.dataset.category = category.id;

    const head = el('div', 'settings-category__head');
    const title = textField('Category name', category.title);
    title.classList.add('settings-category__title');
    title.addEventListener('input', () => {
      category.title = title.value;
    });
    head.append(title);

    const remove = iconButton('delete', `Delete ${category.title}`, async () => {
      const shouldDelete = await confirm({
        titleText: 'Delete category?',
        messageText: `“${category.title}” and its ${category.links.length} link(s) will be removed.`,
        confirmLabel: 'Delete',
      });
      if (!shouldDelete || !draft) return;
      draft.categories.splice(categoryIndex, 1);
      renderCategories();
      focusAfterRender('.settings-add-row md-text-button', {scroll: true});
    });
    head.append(remove);
    block.append(head);

    const links = el('div', 'settings-links');
    category.links.forEach((link, linkIndex) => {
      links.append(renderLink(category, link, linkIndex));
    });
    block.append(links);

    const addLink = textButton('add', 'Add link', () => {
      const link = {id: uid('link'), text: '', url: '', starred: false};
      category.links.push(link);
      renderCategories();
      focusAfterRender(
        `.settings-link[data-link="${CSS.escape(link.id)}"] md-outlined-text-field`,
        {scroll: true},
      );
    });
    addLink.classList.add('settings-add-link');
    block.append(addLink);

    return block;
  }

  function renderLink(category, link, linkIndex) {
    const row = el('div', 'settings-link');
    row.dataset.link = link.id;

    const label = textField('Label', link.text);
    label.classList.add('settings-link__label');
    label.addEventListener('input', () => {
      link.text = label.value;
    });

    const url = textField('URL', link.url, 'url');
    url.classList.add('settings-link__url');
    url.addEventListener('input', () => {
      link.url = url.value;
    });

    const star = iconButton(
      link.starred ? 'star' : 'star_border',
      `${link.starred ? 'Unstar' : 'Star'} ${link.text || 'link'}`,
      () => {
        link.starred = !link.starred;
        renderCategories();
        focusAfterRender(
          `.settings-link[data-link="${CSS.escape(link.id)}"] [data-action="star"]`,
        );
      },
    );
    star.dataset.action = 'star';
    star.classList.toggle('is-starred', link.starred);

    const up = iconButton('arrow_upward', 'Move link up', () => {
      if (linkIndex === 0) return;
      const [moved] = category.links.splice(linkIndex, 1);
      category.links.splice(linkIndex - 1, 0, moved);
      renderCategories();
      focusAfterRender(
        `.settings-link[data-link="${CSS.escape(link.id)}"] [data-action="up"]`,
      );
    });
    up.dataset.action = 'up';
    up.disabled = linkIndex === 0;

    const down = iconButton('arrow_downward', 'Move link down', () => {
      if (linkIndex === category.links.length - 1) return;
      const [moved] = category.links.splice(linkIndex, 1);
      category.links.splice(linkIndex + 1, 0, moved);
      renderCategories();
      focusAfterRender(
        `.settings-link[data-link="${CSS.escape(link.id)}"] [data-action="down"]`,
      );
    });
    down.dataset.action = 'down';
    down.disabled = linkIndex === category.links.length - 1;

    const remove = iconButton('close', 'Delete link', () => {
      category.links.splice(linkIndex, 1);
      renderCategories();
      focusAfterRender(
        `.settings-category[data-category="${CSS.escape(category.id)}"] .settings-add-link`,
        {scroll: true},
      );
    });
    remove.dataset.action = 'delete';

    const tools = el('div', 'settings-link__tools');
    tools.append(star, up, down, remove);

    row.append(label, url, tools);
    return row;
  }

  function renderAppearance() {
    if (!draft) return;
    appearancePanel.replaceChildren();

    appearancePanel.append(
      el('h3', 'settings-subhead md-title-small', 'Theme'),
      el('p', 'settings-hint md-body-small', 'System follows your OS setting.'),
    );

    const themeGroup = el('div', 'settings-choice-group');
    for (const [value, labelText] of [
      ['dark', 'Dark'],
      ['light', 'Light'],
      ['system', 'System'],
    ]) {
      const label = el('label', 'settings-choice');
      const radio = document.createElement('md-radio');
      radio.name = 'settings-theme';
      radio.value = value;
      radio.checked = draft.settings.theme === value;
      radio.addEventListener('change', () => {
        if (!draft || !radio.checked) return;
        draft.settings.theme = value;
        for (const item of themeGroup.querySelectorAll('md-radio')) {
          item.checked = item === radio;
        }
      });
      label.append(radio, el('span', 'md-body-medium', labelText));
      themeGroup.append(label);
    }
    appearancePanel.append(themeGroup);

    appearancePanel.append(
      el('h3', 'settings-subhead md-title-small', 'Search engine'),
      el(
        'p',
        'settings-hint md-body-small',
        'Used for anything that does not look like a URL.',
      ),
    );

    const engineGroup = el('div', 'settings-choice-group settings-choice-group--grid');
    for (const [value, config] of Object.entries(SEARCH_ENGINES)) {
      const label = el('label', 'settings-choice');
      const radio = document.createElement('md-radio');
      radio.name = 'settings-engine';
      radio.value = value;
      radio.checked = draft.settings.searchEngine === value;
      radio.addEventListener('change', () => {
        if (!draft || !radio.checked) return;
        draft.settings.searchEngine = value;
        for (const item of engineGroup.querySelectorAll('md-radio')) {
          item.checked = item === radio;
        }
      });
      label.append(radio, el('span', 'md-body-medium', config.label));
      engineGroup.append(label);
    }
    appearancePanel.append(engineGroup);

    appearancePanel.append(
      el('h3', 'settings-subhead md-title-small', 'Clock'),
      el('p', 'settings-hint md-body-small', '12-hour format is always used.'),
    );

    const secondsRow = el('label', 'settings-choice settings-choice--switch');
    const seconds = document.createElement('md-switch');
    seconds.selected = draft.settings.showSeconds;
    seconds.addEventListener('change', () => {
      if (draft) draft.settings.showSeconds = seconds.selected;
    });
    secondsRow.append(seconds, el('span', 'md-body-medium', 'Show seconds'));
    appearancePanel.append(secondsRow);
  }

  function renderData() {
    dataPanel.querySelector('.settings-imported')?.remove();
    if (importedNotice) {
      const notice = el('p', 'settings-imported md-body-small', importedNotice);
      dataPanel.append(notice);
    }
  }

  function exportData() {
    if (!draft) return;
    const blob = new Blob([exportState(draft)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `startpage-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    toast('Exported bookmarks as JSON');
  }

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    if (!file || !draft) return;
    try {
      const text = await file.text();
      const imported = parseImport(text);
      const shouldImport = await confirm({
        titleText: 'Import bookmarks?',
        messageText: `${imported.categories.length} categories will replace the current draft. Press Save afterwards to keep them.`,
        confirmLabel: 'Import',
        danger: false,
      });
      if (!shouldImport || !draft) return;
      draft.categories = imported.categories;
      if (imported.settings) {
        draft.settings = {...draft.settings, ...imported.settings};
      }
      importedNotice = `Imported ${imported.categories.length} categories. Review them and press Save.`;
      renderCategories();
      renderAppearance();
      renderData();
      toast('Bookmarks imported into the draft');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Could not import file');
    } finally {
      fileInput.value = '';
    }
  });

  async function resetData() {
    const shouldReset = await confirm({
      titleText: 'Reset to defaults?',
      messageText:
        'All categories and links in this draft will be replaced with the default set.',
      confirmLabel: 'Reset',
    });
    if (!shouldReset) return;
    const next = freshState();
    draft = next;
    importedNotice = 'Defaults restored. Press Save to keep them.';
    renderCategories();
    renderAppearance();
    renderData();
  }

  function commit() {
    if (!draft) return;

    const categories = draft.categories.map((category) => ({
      ...category,
      title: category.title.trim() || 'Untitled',
      links: category.links
        .map((link) => ({
          ...link,
          text: link.text.trim(),
          url: safeUrl(link.url),
        }))
        .filter((link) => link.url),
    }));

    const next = normalize({settings: draft.settings, categories});
    onSave(next);
    dialog.close();
    toast('Settings saved');
  }

  return {
    /**
     * @param {number} tabIndex
     * @param {{newLink?: boolean}} [options]
     */
    open(tabIndex = 0, {newLink = false} = {}) {
      draft = clone(getState());
      activeTab = tabIndex;
      importedNotice = '';

      tabs.activeTabIndex = tabIndex;
      renderCategories();
      renderAppearance();
      renderData();
      syncPanels();

      let createdLink = null;
      if (newLink) {
        if (draft.categories.length === 0) {
          draft.categories.push({
            id: uid('cat'),
            title: 'New category',
            links: [],
          });
        }
        const target =
          draft.categories.find((category) => category.links.length > 0) ??
          draft.categories[0];
        if (target) {
          createdLink = {
            id: uid('link'),
            text: '',
            url: '',
            starred: false,
          };
          target.links.push(createdLink);
          renderCategories();
        }
      }

      dialog.show();

      if (createdLink) {
        focusAfterRender(
          `.settings-link[data-link="${CSS.escape(createdLink.id)}"] md-outlined-text-field`,
          {scroll: true},
        );
      }
    },
  };
}
