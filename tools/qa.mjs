import {chromium} from 'playwright-core';
import {readFile} from 'node:fs/promises';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = process.env.BASE ?? 'http://localhost:8080/';
const shots = 'C:\\Users\\Kirill\\AppData\\Local\\Temp\\opencode';

const browser = await chromium.launch({executablePath: EDGE, headless: true});
const context = await browser.newContext({viewport: {width: 1440, height: 950}});
const page = await context.newPage();

const errors = [];
page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(`console: ${message.text()}`);
});

await page.goto(BASE, {waitUntil: 'networkidle'});
await page.waitForTimeout(500);

const report = {};
report.cards = await page.locator('.category-card').count();
report.chips = await page.locator('md-filter-chip').count();
report.links = await page.locator('.link-row').count();
report.theme = await page.getAttribute('html', 'data-theme');
report.colorMode = await page.getAttribute('html', 'data-color-mode');
report.clock = await page.locator('#clock-time').innerText();
report.date = await page.locator('#clock-date').innerText();
report.icons = await page.locator('md-icon svg').count();
report.font = await page.evaluate(() =>
  getComputedStyle(document.body).fontFamily,
);
report.heroSrc = await page.getAttribute('#hero-image', 'src');
report.heroCaption = await page.locator('#hero-caption').innerText();
report.aiLoaders = await page.locator('.ai-loader').count();

await page.screenshot({path: `${shots}/qa-dark-desktop.png`});

// Search suggestions
await page.fill('#search-input', 'git');
await page.waitForTimeout(200);
report.suggestions = await page.locator('.suggestion').count();
report.firstSuggestion = await page
  .locator('.suggestion')
  .first()
  .innerText();
await page.screenshot({path: `${shots}/qa-suggestions.png`});

// Keyboard navigation
await page.keyboard.press('ArrowDown');
report.activeSuggestion = await page
  .locator('.suggestion[aria-selected="true"]')
  .innerText();
await page.keyboard.press('Escape');
report.suggestionsAfterEscape = await page.locator('.suggestion').count();

// Open settings
await page.click('#settings-button');
await page.waitForTimeout(500);
report.settingsOpen = await page.evaluate(
  () => document.querySelector('#settings-dialog').open,
);
report.settingsCategories = await page
  .locator('.settings-category')
  .count();
report.settingsFullscreen = await page.evaluate(() => {
  const host = document.querySelector('#settings-dialog');
  const dialog = host.shadowRoot.querySelector('dialog');
  const content = document.querySelector('.settings-content');
  const rect = (element) => {
    const box = element.getBoundingClientRect();
    return {w: Math.round(box.width), h: Math.round(box.height)};
  };
  return {
    viewport: {w: window.innerWidth, h: window.innerHeight},
    dialog: rect(dialog),
    content: rect(content),
    radius: getComputedStyle(dialog).borderRadius,
  };
});
await page.screenshot({path: `${shots}/qa-settings.png`});

// Appearance tab
await page.evaluate(() => {
  document.querySelector('#settings-tabs').activeTabIndex = 1;
});
await page.waitForTimeout(300);
report.appearanceVisible = await page
  .locator('[data-panel="1"]')
  .isVisible();
report.themeTiles = await page.locator('.theme-tile').count();
report.themeGroups = await page.locator('.theme-section').count();
report.panelsScroll = await page.evaluate(() => {
  const panels = document.querySelector('.settings-panels');
  return {
    client: panels.clientHeight,
    scroll: panels.scrollHeight,
  };
});
await page.screenshot({path: `${shots}/qa-settings-appearance.png`});

// Preview a catalogue theme, then cancel to make sure the page reverts.
await page.click('.theme-tile[data-theme-id="tokyo-night"]');
await page.waitForTimeout(300);
report.previewTheme = await page.getAttribute('html', 'data-theme');
report.previewMode = await page.getAttribute('html', 'data-color-mode');
report.previewSurface = await page.evaluate(() =>
  getComputedStyle(document.documentElement)
    .getPropertyValue('--md-sys-color-surface')
    .trim(),
);
await page.screenshot({path: `${shots}/qa-theme-preview.png`});
report.activeTile = await page
  .locator('.theme-tile[aria-pressed="true"]')
  .getAttribute('data-theme-id');

// Artwork: link a URL, then return to the bundled GIF.
await page.locator('.artwork').scrollIntoViewIfNeeded();
await page.waitForTimeout(200);
report.artworkLabel = await page.locator('.artwork__name').innerText();
await page
  .locator('.artwork__url input')
  .fill('https://example.com/art.gif');
await page.locator('md-text-button', {hasText: 'Use URL'}).click();
await page.waitForTimeout(400);
report.heroUrlStored = await page.evaluate(() => {
  const data = JSON.parse(localStorage.getItem('startpage.data.v2'));
  return data.settings.hero;
});
await page.locator('md-text-button', {hasText: 'Use default'}).click();
await page.waitForTimeout(400);
report.heroResetStored = await page.evaluate(() => {
  const data = JSON.parse(localStorage.getItem('startpage.data.v2'));
  return data.settings.hero;
});
report.heroResetSrc = await page.getAttribute('#hero-image', 'src');

// Close via cancel
await page.click('[data-settings-cancel]');
await page.waitForTimeout(300);
report.settingsClosed = !(await page.evaluate(
  () => document.querySelector('#settings-dialog').open,
));
report.themeAfterCancel = await page.getAttribute('html', 'data-theme');

// Star the second link in the first card
const star = page.locator('.category-card').first().locator('.link-row__star').first();
await page.locator('.link-row').first().hover();
await star.click();
await page.waitForTimeout(300);
report.starPressed = await star.getAttribute('aria-pressed');
report.storedStar = await page.evaluate(() => {
  const data = JSON.parse(localStorage.getItem('startpage.data.v2'));
  return data.categories[0].links[0].starred;
});

// Starred filter
await page.locator('md-filter-chip', {hasText: 'Starred'}).click();
await page.waitForTimeout(300);
report.starredCards = await page.locator('.category-card').count();
report.starredLinks = await page.locator('.link-row').count();
report.starredTitle = await page
  .locator('.category-card__title')
  .first()
  .innerText();
await page.screenshot({path: `${shots}/qa-starred.png`});

// Back to All, toggle theme
await page.locator('md-filter-chip', {hasText: 'All'}).click();
await page.click('#theme-toggle');
await page.waitForTimeout(300);
report.themeAfterToggle = await page.getAttribute('html', 'data-theme');
await page.screenshot({path: `${shots}/qa-light.png`});

// Reload persistence
await page.reload({waitUntil: 'networkidle'});
await page.waitForTimeout(300);
report.themeAfterReload = await page.getAttribute('html', 'data-theme');
report.modeAfterReload = await page.getAttribute('html', 'data-color-mode');
report.starAfterReload = await page
  .locator('.link-row__star')
  .first()
  .getAttribute('aria-pressed');

// Search opens a result in a new tab
await page.fill('#search-input', 'github');
await page.waitForTimeout(200);
const popupPromise = context.waitForEvent('page', {timeout: 5000}).catch(() => null);
await page.keyboard.press('ArrowDown');
await page.keyboard.press('ArrowDown');
await page.keyboard.press('Enter');
const popup = await popupPromise;
report.popupUrl = popup ? popup.url() : '(none)';
if (popup) await popup.close();

// Mobile
const mobile = await context.newPage();
await mobile.setViewportSize({width: 390, height: 844});
await mobile.goto(BASE, {waitUntil: 'networkidle'});
await mobile.waitForTimeout(500);
report.mobileCards = await mobile.locator('.category-card').count();
await mobile.screenshot({path: `${shots}/qa-mobile.png`, fullPage: false});
await mobile.click('#settings-button');
await mobile.waitForTimeout(400);
report.mobileSettings = await mobile.evaluate(() => {
  const content = document
    .querySelector('.settings-content')
    .getBoundingClientRect();
  return [Math.round(content.width), Math.round(content.height)];
});
await mobile.screenshot({path: `${shots}/qa-mobile-settings.png`});

// Settings: reorder a link with the arrow buttons, then save.
await page.click('#settings-button');
await page.waitForTimeout(500);
const statsRow = page
  .locator('.settings-category')
  .first()
  .locator('.settings-link')
  .nth(1);
await statsRow.locator('[data-action="up"]').click();
await page.waitForTimeout(200);
await page.click('[data-settings-save]');
await page.waitForTimeout(400);
report.firstLinkAfterReorder = await page.evaluate(() => {
  const data = JSON.parse(localStorage.getItem('startpage.data.v2'));
  return data.categories[0].links[0].text;
});

// Settings: add a bookmark from the FAB and save it.
await page.click('#add-link-fab');
await page.waitForTimeout(500);
report.fabSettingsOpen = await page.evaluate(
  () => document.querySelector('#settings-dialog').open,
);
report.fabFocus = await page.evaluate(
  () => document.activeElement?.tagName.toLowerCase() ?? '',
);
const newLinkRow = page
  .locator('.settings-category')
  .first()
  .locator('.settings-link')
  .last();
const newLinkInputs = newLinkRow.locator('input');
await newLinkInputs.nth(0).fill('qa link');
await newLinkInputs.nth(1).fill('qa.example.com');
await page.click('[data-settings-save]');
await page.waitForTimeout(400);
report.savedLink = await page.evaluate(() => {
  const data = JSON.parse(localStorage.getItem('startpage.data.v2'));
  const link = data.categories[0].links.at(-1);
  return {text: link.text, url: link.url};
});

const firstCard = page.locator('.category-card').first();
await firstCard.locator('.pager-button[data-dir="1"]').click();
await firstCard.locator('.pager-button[data-dir="1"]').click();
await page.waitForTimeout(300);
report.addedLinkVisible = await page
  .locator('.link-row__text', {hasText: 'qa link'})
  .isVisible()
  .catch(() => false);
report.lastPageLabel = await firstCard.locator('.pager-label').innerText();

// Settings: show seconds in the clock.
await page.click('#settings-button');
await page.waitForTimeout(400);
await page.evaluate(() => {
  document.querySelector('#settings-tabs').activeTabIndex = 1;
});
await page.waitForTimeout(300);
await page.locator('md-switch').click();
await page.click('[data-settings-save]');
await page.waitForTimeout(1200);
report.clockWithSeconds = await page.locator('#clock-time').innerText();
report.showSecondsStored = await page.evaluate(() => {
  const data = JSON.parse(localStorage.getItem('startpage.data.v2'));
  return data.settings.showSeconds;
});

// Settings: export the bookmark set as JSON.
await page.click('#settings-button');
await page.waitForTimeout(400);
await page.evaluate(() => {
  document.querySelector('#settings-tabs').activeTabIndex = 2;
});
await page.waitForTimeout(300);
const [download] = await Promise.all([
  page.waitForEvent('download'),
  page.locator('md-text-button', {hasText: 'Export JSON'}).click(),
]);
report.exportName = download.suggestedFilename();
const exported = JSON.parse(await readFile(await download.path(), 'utf8'));
report.exportCategories = exported.categories.length;
report.exportLinks = exported.categories.reduce(
  (total, category) => total + category.links.length,
  0,
);

// Settings: import a small set and save it.
const importPayload = JSON.stringify({
  version: 2,
  settings: {theme: 'dark', searchEngine: 'google', showSeconds: false},
  categories: [
    {
      title: 'Imported',
      links: [{text: 'example', url: 'example.com'}],
    },
  ],
});
await page
  .locator('input[type="file"][accept*="json"]')
  .setInputFiles({
    name: 'import.json',
    mimeType: 'application/json',
    buffer: Buffer.from(importPayload),
  });
await page.waitForTimeout(500);
report.confirmOpen = await page.evaluate(
  () => document.querySelector('#confirm-dialog').open,
);
await page.click('[data-confirm-ok]');
await page.waitForTimeout(500);
report.importNotice = await page
  .locator('.settings-imported')
  .innerText()
  .catch(() => '');
report.importedRows = await page.locator('.settings-link').count();
await page.click('[data-settings-save]');
await page.waitForTimeout(500);
report.importCards = await page.locator('.category-card').count();
report.importCategory = await page
  .locator('.category-card__title')
  .first()
  .innerText();
report.importLink = await page
  .locator('.link-row__text')
  .first()
  .innerText();
report.importedUrl = await page.evaluate(() => {
  const data = JSON.parse(localStorage.getItem('startpage.data.v2'));
  return data.categories[0].links[0].url;
});
report.themeAfterImport = await page.getAttribute('html', 'data-theme');

// Legacy storage: bookmarksData is migrated on first load.
const legacyContext = await browser.newContext({
  viewport: {width: 1200, height: 900},
});
await legacyContext.addInitScript(() => {
  localStorage.setItem(
    'bookmarksData',
    JSON.stringify([
      {
        title: 'Legacy',
        links: [{text: 'old link', url: 'https://example.org'}],
      },
    ]),
  );
});
const legacyPage = await legacyContext.newPage();
await legacyPage.goto(BASE, {waitUntil: 'networkidle'});
await legacyPage.waitForTimeout(300);
report.legacyCards = await legacyPage.locator('.category-card').count();
report.legacyCategory = await legacyPage
  .locator('.category-card__title')
  .innerText();
report.legacyLink = await legacyPage.locator('.link-row__text').innerText();
report.legacyMigrated = await legacyPage.evaluate(() => {
  const raw = localStorage.getItem('startpage.data.v2');
  const data = raw ? JSON.parse(raw) : null;
  return data
    ? {version: data.version, url: data.categories[0].links[0].url}
    : null;
});
await legacyContext.close();

// System theme follows the OS preference before the first paint.
const systemContext = await browser.newContext({
  viewport: {width: 1200, height: 900},
  colorScheme: 'light',
});
await systemContext.addInitScript(() => {
  localStorage.setItem(
    'startpage.data.v2',
    JSON.stringify({
      version: 2,
      settings: {
        theme: 'system',
        searchEngine: 'duckduckgo',
        showSeconds: false,
      },
      categories: [],
    }),
  );
});
const systemPage = await systemContext.newPage();
await systemPage.goto(BASE, {waitUntil: 'networkidle'});
await systemPage.waitForTimeout(300);
report.systemTheme = await systemPage.getAttribute('html', 'data-theme');
report.systemMode = await systemPage.getAttribute('html', 'data-color-mode');
report.systemStored = await systemPage.evaluate(() => {
  const data = JSON.parse(localStorage.getItem('startpage.data.v2'));
  return data.settings.colorMode;
});
await systemContext.close();

report.errors = errors;
console.log(JSON.stringify(report, null, 2));

await browser.close();
