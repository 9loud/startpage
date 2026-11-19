/**
 * Theme catalogue.
 *
 * Palette source: the theme engine in Zenith Tracker
 * (https://github.com/NajmosSalahin/Zenith_Tracker, MIT).
 * Each theme lists the six colours that project uses; `tools/build.mjs`
 * expands them into the full Material 3 role set (css/themes.css).
 *
 * Keep this file dependency-free: build.mjs imports it, and the page loads it
 * at runtime for the settings picker.
 */

/** @typedef {{id: string, name: string, group: string, bg: string, surface: string, border: string, textMain: string, textMuted: string, primary: string}} ThemeSource */
/** @typedef {ThemeSource & {mode: 'light'|'dark'}} Theme */

/** @type {ThemeSource[]} */
const SOURCES = [
  // Dark
  {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    group: 'Dark',
    bg: '#1a1b26',
    surface: '#24283b',
    border: '#414868',
    textMain: '#c0caf5',
    textMuted: '#565f89',
    primary: '#7aa2f7',
  },
  {
    id: 'dracula',
    name: 'Dracula',
    group: 'Dark',
    bg: '#282a36',
    surface: '#44475a',
    border: '#6272a4',
    textMain: '#f8f8f2',
    textMuted: '#6272a4',
    primary: '#bd93f9',
  },
  {
    id: 'nord',
    name: 'Nord',
    group: 'Dark',
    bg: '#2e3440',
    surface: '#3b4252',
    border: '#4c566a',
    textMain: '#eceff4',
    textMuted: '#d8dee9',
    primary: '#88c0d0',
  },
  {
    id: 'gruvbox-dark',
    name: 'Gruvbox Dark',
    group: 'Dark',
    bg: '#282828',
    surface: '#3c3836',
    border: '#504945',
    textMain: '#ebdbb2',
    textMuted: '#a89984',
    primary: '#fabd2f',
  },
  {
    id: 'catppuccin-mocha',
    name: 'Catppuccin Mocha',
    group: 'Dark',
    bg: '#1e1e2e',
    surface: '#313244',
    border: '#45475a',
    textMain: '#cdd6f4',
    textMuted: '#a6adc8',
    primary: '#cba6f7',
  },
  {
    id: 'catppuccin-macchiato',
    name: 'Catppuccin Macchiato',
    group: 'Dark',
    bg: '#24273a',
    surface: '#363a4f',
    border: '#494d64',
    textMain: '#cad3f5',
    textMuted: '#a5adcb',
    primary: '#8aadf4',
  },
  {
    id: 'catppuccin-frappe',
    name: 'Catppuccin Frappé',
    group: 'Dark',
    bg: '#303446',
    surface: '#414559',
    border: '#51576d',
    textMain: '#c6d0f5',
    textMuted: '#a5adce',
    primary: '#e78284',
  },
  {
    id: 'one-dark',
    name: 'One Dark',
    group: 'Dark',
    bg: '#282c34',
    surface: '#353b45',
    border: '#545862',
    textMain: '#abb2bf',
    textMuted: '#5c6370',
    primary: '#61afef',
  },
  {
    id: 'ayu-dark',
    name: 'Ayu Dark',
    group: 'Dark',
    bg: '#0f1419',
    surface: '#14191f',
    border: '#1f2428',
    textMain: '#e6e1cf',
    textMuted: '#5c6773',
    primary: '#ffb454',
  },
  {
    id: 'palenight',
    name: 'Palenight',
    group: 'Dark',
    bg: '#292d3e',
    surface: '#32374d',
    border: '#43475e',
    textMain: '#bfc7d5',
    textMuted: '#697098',
    primary: '#c792ea',
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    group: 'Dark',
    bg: '#011627',
    surface: '#0b2942',
    border: '#1d3b53',
    textMain: '#d6deeb',
    textMuted: '#5f7e97',
    primary: '#82aaff',
  },
  {
    id: 'oceanic-next',
    name: 'Oceanic Next',
    group: 'Dark',
    bg: '#1b2b34',
    surface: '#343d46',
    border: '#4f5b66',
    textMain: '#d8dee9',
    textMuted: '#65737e',
    primary: '#6699cc',
  },
  {
    id: 'monokai-pro',
    name: 'Monokai Pro',
    group: 'Dark',
    bg: '#2d2a2e',
    surface: '#403e41',
    border: '#5b595c',
    textMain: '#fcfcfa',
    textMuted: '#939293',
    primary: '#ff6188',
  },
  {
    id: 'material-dark',
    name: 'Material Dark',
    group: 'Dark',
    bg: '#263238',
    surface: '#37474f',
    border: '#455a64',
    textMain: '#eeffff',
    textMuted: '#546e7a',
    primary: '#80cbc4',
  },
  {
    id: 'synthwave',
    name: 'Synthwave',
    group: 'Dark',
    bg: '#2b213a',
    surface: '#241b2f',
    border: '#3a2f4c',
    textMain: '#f92aad',
    textMuted: '#8b809a',
    primary: '#36f9f6',
  },

  // Light
  {
    id: 'catppuccin-latte',
    name: 'Catppuccin Latte',
    group: 'Light',
    bg: '#eff1f5',
    surface: '#e6e9ef',
    border: '#ccd0da',
    textMain: '#4c4f69',
    textMuted: '#8c8fa1',
    primary: '#1e66f5',
  },
  {
    id: 'github-light',
    name: 'GitHub Light',
    group: 'Light',
    bg: '#ffffff',
    surface: '#f6f8fa',
    border: '#d0d7de',
    textMain: '#24292f',
    textMuted: '#57606a',
    primary: '#0969da',
  },
  {
    id: 'solarized-light',
    name: 'Solarized Light',
    group: 'Light',
    bg: '#fdf6e3',
    surface: '#eee8d5',
    border: '#ccc2a3',
    textMain: '#657b83',
    textMuted: '#93a1a1',
    primary: '#268bd2',
  },
  {
    id: 'gruvbox-light',
    name: 'Gruvbox Light',
    group: 'Light',
    bg: '#fbf1c7',
    surface: '#ebdbb2',
    border: '#d5c4a1',
    textMain: '#3c3836',
    textMuted: '#7c6f64',
    primary: '#9d0006',
  },
  {
    id: 'one-light',
    name: 'One Light',
    group: 'Light',
    bg: '#fafafa',
    surface: '#f0f0f1',
    border: '#e5e5e6',
    textMain: '#383a42',
    textMuted: '#a0a1a7',
    primary: '#4078f2',
  },
  {
    id: 'rose-pine-dawn',
    name: 'Rosé Pine Dawn',
    group: 'Light',
    bg: '#faf4ed',
    surface: '#fffaf3',
    border: '#dfdad9',
    textMain: '#575279',
    textMuted: '#9893a5',
    primary: '#286983',
  },
  {
    id: 'ayu-light',
    name: 'Ayu Light',
    group: 'Light',
    bg: '#fafafa',
    surface: '#f3f4f5',
    border: '#e1e3e4',
    textMain: '#5c6166',
    textMuted: '#8a9199',
    primary: '#ff9940',
  },
  {
    id: 'paper',
    name: 'Paper',
    group: 'Light',
    bg: '#f4f4f4',
    surface: '#ffffff',
    border: '#dddddd',
    textMain: '#333333',
    textMuted: '#888888',
    primary: '#222222',
  },
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    group: 'Light',
    bg: '#ffffff',
    surface: '#fafafa',
    border: '#eaeaea',
    textMain: '#000000',
    textMuted: '#666666',
    primary: '#0070f3',
  },
  {
    id: 'soft-light',
    name: 'Soft Light',
    group: 'Light',
    bg: '#fdfdfd',
    surface: '#f5f5f5',
    border: '#e0e0e0',
    textMain: '#2d3748',
    textMuted: '#718096',
    primary: '#3182ce',
  },

  // Vibrant
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    group: 'Vibrant',
    bg: '#fce205',
    surface: '#ffed4a',
    border: '#121212',
    textMain: '#121212',
    textMuted: '#333333',
    primary: '#ff003c',
  },
  {
    id: 'outrun',
    name: 'Outrun',
    group: 'Vibrant',
    bg: '#100b21',
    surface: '#1b1236',
    border: '#2a1e4a',
    textMain: '#00ffff',
    textMuted: '#956ce2',
    primary: '#ff00ff',
  },
  {
    id: 'ruby',
    name: 'Ruby',
    group: 'Vibrant',
    bg: '#3a0d16',
    surface: '#4d131f',
    border: '#6b1c2e',
    textMain: '#ffe0e6',
    textMuted: '#b36d7a',
    primary: '#ff4d6d',
  },
  {
    id: 'sapphire',
    name: 'Sapphire',
    group: 'Vibrant',
    bg: '#0b192c',
    surface: '#112b4a',
    border: '#1e4b7a',
    textMain: '#d9f0ff',
    textMuted: '#77adc4',
    primary: '#4dc4ff',
  },
  {
    id: 'emerald',
    name: 'Emerald',
    group: 'Vibrant',
    bg: '#08261b',
    surface: '#0e3828',
    border: '#185942',
    textMain: '#d9fceb',
    textMuted: '#6ab894',
    primary: '#2ecc71',
  },
  {
    id: 'amethyst',
    name: 'Amethyst',
    group: 'Vibrant',
    bg: '#1e112a',
    surface: '#2c193d',
    border: '#462b5c',
    textMain: '#f0d9ff',
    textMuted: '#9671b5',
    primary: '#b854ff',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    group: 'Vibrant',
    bg: '#2b151e',
    surface: '#3e1e28',
    border: '#5c2d3a',
    textMain: '#ffebd9',
    textMuted: '#c48b98',
    primary: '#ff7b54',
  },
  {
    id: 'neon',
    name: 'Neon',
    group: 'Vibrant',
    bg: '#000000',
    surface: '#111111',
    border: '#333333',
    textMain: '#ffffff',
    textMuted: '#888888',
    primary: '#39ff14',
  },

  // Earthy / pastel
  {
    id: 'rose-pine',
    name: 'Rosé Pine',
    group: 'Earthy',
    bg: '#191724',
    surface: '#1f1d2e',
    border: '#26233a',
    textMain: '#e0def4',
    textMuted: '#908caa',
    primary: '#ebbcba',
  },
  {
    id: 'forest',
    name: 'Forest',
    group: 'Earthy',
    bg: '#1a2421',
    surface: '#23302c',
    border: '#334540',
    textMain: '#e3ebd8',
    textMuted: '#8b9c8b',
    primary: '#a3be8c',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    group: 'Earthy',
    bg: '#15202b',
    surface: '#1c2732',
    border: '#2a3b4a',
    textMain: '#ffffff',
    textMuted: '#8899a6',
    primary: '#1da1f2',
  },
  {
    id: 'desert',
    name: 'Desert',
    group: 'Earthy',
    bg: '#332b25',
    surface: '#423730',
    border: '#594a42',
    textMain: '#fcecd4',
    textMuted: '#ab9582',
    primary: '#d28c5a',
  },
  {
    id: 'coffee',
    name: 'Coffee',
    group: 'Earthy',
    bg: '#2b211a',
    surface: '#382b22',
    border: '#4d3b2f',
    textMain: '#f2e8de',
    textMuted: '#998373',
    primary: '#c49a7a',
  },
  {
    id: 'matcha',
    name: 'Matcha',
    group: 'Earthy',
    bg: '#f2f5ec',
    surface: '#e5ecd9',
    border: '#ccd9b8',
    textMain: '#364026',
    textMuted: '#72805e',
    primary: '#779933',
  },
  {
    id: 'lavender',
    name: 'Lavender',
    group: 'Earthy',
    bg: '#f7f5fa',
    surface: '#edeaf2',
    border: '#d9d2e6',
    textMain: '#463c5e',
    textMuted: '#847a9e',
    primary: '#8c70d1',
  },
];

/** Relative luminance of a `#rrggbb` colour. */
function luminance(hex) {
  const value = hex.replace('#', '');
  const channels = [0, 2, 4].map((offset) => {
    const channel = parseInt(value.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

/** @type {Theme[]} */
export const THEMES = SOURCES.map((theme) => ({
  ...theme,
  mode: luminance(theme.bg) > 0.4 ? 'light' : 'dark',
}));

export const THEME_GROUPS = ['Dark', 'Light', 'Vibrant', 'Earthy'];

/** Built-in palettes generated from the gruvbox seeds in build.mjs. */
export const BUILTIN_THEMES = [
  {
    id: 'system',
    name: 'System',
    group: 'Built-in',
    preview: {bg: '#19120b', surface: '#251e16', primary: '#ffb68a', text: '#eee0d3', mode: 'dark'},
  },
  {
    id: 'dark',
    name: 'Default dark',
    group: 'Built-in',
    preview: {bg: '#19120b', surface: '#251e16', primary: '#ffb68a', text: '#eee0d3', mode: 'dark'},
  },
  {
    id: 'light',
    name: 'Default light',
    group: 'Built-in',
    preview: {bg: '#fff8f4', surface: '#f4ece6', primary: '#8b4f26', text: '#201b16', mode: 'light'},
  },
];

/** @param {string} id */
export function findTheme(id) {
  return THEMES.find((theme) => theme.id === id) ?? null;
}

/** Resolves any stored theme value to a concrete palette id and mode. */
export function resolveTheme(setting, systemPrefersLight = false) {
  if (setting === 'system') {
    const mode = systemPrefersLight ? 'light' : 'dark';
    return {id: mode, mode};
  }
  if (setting === 'light' || setting === 'dark') {
    return {id: setting, mode: setting};
  }
  const theme = findTheme(setting);
  if (theme) return {id: theme.id, mode: theme.mode};
  return {id: 'dark', mode: 'dark'};
}

/** Every value `settings.theme` may hold. */
export const THEME_VALUES = [
  ...BUILTIN_THEMES.map((theme) => theme.id),
  ...THEMES.map((theme) => theme.id),
];
