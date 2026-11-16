/**
 * Default bookmarks. The set mirrors the original start page; empty "#"
 * placeholder rows were removed.
 */
export const DEFAULT_SETTINGS = {
  theme: 'dark',
  searchEngine: 'duckduckgo',
  showSeconds: false,
};

export const SEARCH_ENGINES = {
  duckduckgo: {label: 'DuckDuckGo', url: 'https://duckduckgo.com/?q='},
  google: {label: 'Google', url: 'https://www.google.com/search?q='},
  yandex: {label: 'Yandex', url: 'https://yandex.com/search/?text='},
  bing: {label: 'Bing', url: 'https://www.bing.com/search?q='},
};

export function createDefaultCategories() {
  return [
    {
      title: 'learn',
      links: [
        {text: 'tracker', url: 'https://najmossalahin.github.io/Task_Tracker/'},
        {
          text: 'statistics',
          url: 'https://www.coursera.org/learn/stanford-statistics/home/',
        },
        {
          text: 'python',
          url: 'https://www.youtube.com/playlist?list=PL-osiE80TeTt2d9bfVyTiXJA-UTHn6WwU/',
        },
        {
          text: 'codewars',
          url: 'https://www.codewars.com/kata/search/python?q=&r%5B%5D=-8&beta=false&order_by=sort_date%20desc/',
        },
        {text: 'beecrowd', url: 'https://judge.beecrowd.com/'},
        {text: 'renshuu', url: 'https://www.renshuu.org/me'},
        {text: 'language', url: 'https://forvo.com/'},
        {
          text: 'kana lrn',
          url: 'https://najmossalahin.github.io/Ai_Kana_Learning_Tool/',
        },
        {
          text: 'kana quiz',
          url: 'https://gohoneko.neocities.org/learn/kana',
        },
        {text: 'kanji lrn', url: 'https://najmossalahin.github.io/Kanji_Tool/'},
        {text: 'kanji db', url: 'https://thekanjimap.com/'},
      ],
    },
    {
      title: 'dev',
      links: [
        {text: 'devdocs', url: 'https://devdocs.io/'},
        {text: 'github', url: 'https://github.com/NajmosSalahin/'},
        {text: 'devtools', url: 'https://appdevtools.com/'},
        {text: 'rentry', url: 'https://rentry.org/'},
        {text: 'gist git', url: 'https://gist.github.com/'},
        {
          text: 'linkedin',
          url: 'https://www.linkedin.com/in/md-najmos-salahin-185106371/',
        },
      ],
    },
    {
      title: 'database',
      links: [
        {text: 'letterboxd', url: 'https://letterboxd.com/ChouCho_P/'},
        {
          text: 'storygraph',
          url: 'https://app.thestorygraph.com/profile/choucho_p/',
        },
        {text: 'lastfm', url: 'https://www.last.fm/user/NajAdib/'},
        {
          text: 'mangalist',
          url: 'https://myanimelist.net/mangalist/Naju_adib?/',
        },
        {text: 'rawg', url: 'https://rawg.io/@choucho_p/games'},
        {text: 'recipe', url: 'https://www.myrecipes.com/'},
        {text: 'dog die', url: 'https://www.doesthedogdie.com/'},
      ],
    },
    {
      title: 'play',
      links: [
        {text: 'monkeytype', url: 'https://monkeytype.com/'},
        {text: 'lichess', url: 'https://lichess.org/'},
        {text: 'bongo cat', url: 'https://bongo.cat/'},
        {text: 'mynoise', url: 'https://mynoise.net/'},
        {text: 'cat noise', url: 'https://purrli.com/'},
        {text: 'neal', url: 'https://neal.fun/'},
        {
          text: 'solar',
          url: 'https://joshworth.com/dev/pixelspace/pixelspace_solarsystem.html',
        },
        {
          text: 'sleepytime',
          url: 'https://sleepopolis.com/calculators/sleep/',
        },
      ],
    },
    {
      title: 'Unusual',
      links: [
        {text: 'fmhy', url: 'https://fmhy.net/'},
        {text: 'the index', url: 'https://theindex.moe/'},
        {text: 'nyaa', url: 'https://nyaa.si/'},
        {text: '1337x', url: 'https://1337x.to/home/'},
        {text: 'rawdl', url: 'https://dl-raw.ac/'},
        {text: 'dl server', url: 'https://server.elscione.com/'},
        {text: 'z-lib', url: 'https://z-lib.gd/'},
        {text: 'roms', url: 'https://r-roms.github.io/'},
      ],
    },
    {
      title: 'social',
      links: [
        {text: 'reddit', url: 'https://reddit.com/'},
        {text: '4chan', url: 'https://4chan.org/'},
        {text: 'youtube', url: 'https://youtube.com/'},
        {text: 'animepahe', url: 'https://animepahe.ru/'},
        {text: 'cubari', url: 'https://proxy.cubari.moe/#/'},
        {text: 'x', url: 'https://x.com/'},
        {text: 'telegram', url: 'http://web.telegram.org/'},
        {
          text: 'discord',
          url: 'https://discord.com/channels/981539676550750228/1237586485234892841/',
        },
        {text: 'radio', url: 'https://radio.garden/browse'},
        {text: 'footybite', url: 'https://www.footybite.to/'},
        {text: 'music', url: 'https://dab.yeet.su/'},
        {text: 'animethemes', url: 'https://animethemes.moe/'},
        {text: 'bdix', url: 'https://bdixtv24.com/live-tv/'},
      ],
    },
    {
      title: 'tools',
      links: [
        {text: 'excalidraw', url: 'https://excalidraw.com/'},
        {text: 'diagram', url: 'https://app.diagrams.net/'},
        {text: 'desmos', url: 'https://www.desmos.com/'},
        {text: 'gamma', url: 'https://gamma.app/create'},
        {text: 'colab', url: 'https://colab.research.google.com/'},
        {text: 'omni calc', url: 'https://www.omnicalculator.com/'},
      ],
    },
    {
      title: 'misc',
      links: [
        {text: 'calendar', url: 'https://calendar.google.com/calendar/u/0'},
        {text: 'future me', url: 'https://www.futureme.org/'},
        {text: 'knowledge', url: 'https://rentry.org/the-piracy-glossary'},
        {
          text: 'link vault',
          url: 'https://najmossalahin.github.io/AI_Link_Vault/',
        },
        {text: 'mood track', url: 'https://najmossalahin.github.io/Zenith_Tracker/'},
        {
          text: 'virus find',
          url: 'https://www.virustotal.com/gui/home/upload',
        },
        {text: 'fake id', url: 'https://www.fakenamegenerator.com/'},
        {text: 'fake img', url: 'https://thispersondoesnotexist.com/'},
      ],
    },
  ];
}
