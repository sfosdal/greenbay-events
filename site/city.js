// The city — every fact that makes this calendar Green Bay's rather than
// another town's, in one place (2026-10-11: built from the Chicago copy the
// same day). The browser (filter.js, app.js) and the build (scripts/*.mjs)
// both read it; nothing else names a venue or a team. The shared files
// (app.js, filter.js, styles.css bar its --v-* hues, scripts/*.mjs bar
// fetch-events.mjs and sources.mjs) are lqa-events' own, byte for byte —
// see README "Sister sites".
//
// Loaded before filter.js (a plain script, so the tests can share it): it
// sets globalThis.LQACity (the name is the shared code's, not the city's).
(function (global) {
  'use strict';

  // The home teams, matched on the event title whatever the venue. Order =
  // the Teams strip, left to right. Per team:
  //   re        the title match
  //   venue     the home building; schedule = the club's own schedule page
  //   sport     keys the strip icon (app.js SPORT_ICONS), the game clock,
  //             the leader categories
  //   colors    [primary, accent] — the season calendar's home cells and
  //             card frames
  //   espn      ESPN's sport/league/team id — the Packers, the Phoenix, the
  //             Brewers and the Bucks are on ESPN, so the season, the form
  //             block, news and transactions come from there (schedules.mjs);
  //             the Brewers' season comes from MLB's stats API (first-pitch
  //             times, the standings); the Gamblers' from HockeyTech's USHL
  //             feed (the same modulekit the WHL publishes through)
  //   division  (baseball) the division rivals by the abbreviations the
  //             schedule carries, for the standings line
  //   club      the club's name on Ticketmaster; news the outlets' feeds;
  //             wiki the article; opens when the season usually starts
  // The Brewers and the Bucks play in Milwaukee, two hours down I-43: their
  // home building is no venue of this calendar, so they are Teams-view only
  // (the schedule, the form block, the live game), as Everett lists the
  // Seattle clubs — no home game of theirs enters the listing.
  var MLB = function (slug) { return ['https://www.mlb.com/' + slug + '/feeds/news/rss.xml', 'MLB.com']; };
  var USHL = { league: 'ushl', key: 'e828f89b243dc43f' }; // HockeyTech's USHL feed (client_code ushl); the WHL key is refused here
  var TEAMS = [
    { slug: 'packers', label: 'Packers', re: /packers/i, sport: 'football', venue: 'Lambeau Field', colors: ['#203731', '#ffb612'],
      espn: { sport: 'football', league: 'nfl', id: '9' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/gb.png', schedule: 'https://www.packers.com/schedule/',
      club: 'Green Bay Packers', opens: 'September', wiki: { title: 'Green Bay Packers', startYear: true },
      news: [['https://www.packers.com/rss/news', 'Packers.com']] },
    // Green Bay Gamblers, USHL (since 1994), the Resch Center. HockeyTech's
    // USHL feed names its regular seasons "2026-27" with no suffix, and the
    // shared adapter looks for the words "Regular Season" — so until that
    // test is widened the build logs "gamblers skipped" and the tab points
    // at the club's own schedule; the home games are in the listing from
    // Ticketmaster all the same
    { slug: 'gamblers', label: 'Gamblers', name: 'Green Bay Gamblers', abbr: 'GB', re: /gamblers/i, sport: 'hockey', venue: 'Resch Center', colors: ['#00843d', '#ffb81c'],
      season: { kind: 'hockeytech', league: USHL.league, key: USHL.key, id: 15, leagueName: 'USHL' }, form: { kind: 'hockeytech', league: USHL.league, key: USHL.key, id: 15 },
      logo: 'https://assets.leaguestat.com/ushl/logos/15.png', schedule: 'https://gamblershockey.com/schedule',
      club: 'Green Bay Gamblers', opens: 'late September', wiki: { title: 'Green Bay Gamblers' } },
    // UW–Green Bay men's basketball, Horizon League, the Resch Center. ESPN's
    // plain schedule call answers with the season type in progress, and the
    // shared adapter asks for the regular season as well only for the NBA —
    // so until ESPN flips to the regular season (early November) the tab is empty
    { slug: 'phoenix', label: 'Phoenix', name: 'Green Bay Phoenix', abbr: 'GB', re: /green bay phoenix|\bphoenix (men|women)/i, sport: 'basketball', venue: 'Resch Center', colors: ['#00563f', '#ffb612'],
      espn: { sport: 'basketball', league: 'mens-college-basketball', id: '2739' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2739.png', schedule: 'https://greenbayphoenix.com/sports/mens-basketball/schedule',
      club: 'Green Bay Phoenix', opens: 'November', wiki: { title: "Green Bay Phoenix men's basketball", teamPage: true } },
    { slug: 'brewers', label: 'Brewers', re: /brewers/i, sport: 'baseball', venue: 'American Family Field', colors: ['#12284b', '#ffc52f'],
      espn: { sport: 'baseball', league: 'mlb', id: '8' }, season: { kind: 'mlb', id: 158 }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/mil.png', schedule: 'https://www.mlb.com/brewers/schedule',
      club: 'Milwaukee Brewers', opens: 'late March', wiki: { title: 'Milwaukee Brewers' },
      division: ['CHC', 'STL', 'CIN', 'PIT'], // NL Central
      news: [MLB('brewers')] },
    { slug: 'bucks', label: 'Bucks', re: /\bbucks\b/i, sport: 'basketball', venue: 'Fiserv Forum', colors: ['#00471b', '#eee1c6'],
      espn: { sport: 'basketball', league: 'nba', id: '15' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/nba/500/mil.png', schedule: 'https://www.nba.com/bucks/schedule',
      club: 'Milwaukee Bucks', opens: 'late October', wiki: { title: 'Milwaukee Bucks' } },
  ];

  // The venues, one record each — downtown and the stadiums first by size,
  // then the music rooms and the Fox Cities. Per venue:
  //   capacity how many people the place holds
  //   area     'town' for the music rooms across the city and the rooms down
  //            the Fox River (the panel's second group); absent = the
  //            Resch campus, Lambeau and downtown
  //   type     the event type when the title decides nothing
  //   cssVar   the hue styles.css sets for it (dark block --v-*); color
  //            the same hue as a value, for the series graph
  //   url      the venue's own events listing — not a ticket vendor
  //   icon     a mark for listings without a team crest
  //   tm       its Ticketmaster Discovery listing (fetch-events.mjs reads
  //            the venue by id — every page), as Chicago; no city sweep
  //   alias    the other spellings the feeds use for it, folded to this name
  // No festivals yet, so the panel's Festivals group folds away (app.js).
  // Looked up and left out (2026-10-11): the Weidner Center, the Kress
  // Events Center, Capital Credit Union Park (the Rockers — spring), the
  // Oneida Casino pavilion and the Ashwaubenon PAC list nothing on
  // Ticketmaster; the Meyer's Backstage, the Tarlton and the Thompson
  // Center on Lourdes are not on it at all.
  var VENUES = {
    // --- Downtown and the stadiums: the Resch campus across from Lambeau, Lambeau itself, the Meyer on Washington Street ---
    'Resch Center': {
      geo: [44.50021, -88.05656],
      capacity: 10200,
      type: 'concert',
      cssVar: '--v-resch',
      color: '#86eaa7',
      url: 'https://www.reschcenter.com/events',
      icon: 'https://www.google.com/s2/favicons?domain=www.reschcenter.com&sz=128',
      tm: { id: 'KovZpZAal6lA', match: 'resch center', fallbackUrl: 'https://www.reschcenter.com/events', exclude: /parking/i },
      alias: /resch center/i,
    },
    'Lambeau Field': {
      geo: [44.50124, -88.06224],
      capacity: 81441,
      type: 'sports',
      cssVar: '--v-lambeau',
      color: '#c486ea',
      url: 'https://www.packers.com/lambeau-field/lambeau-field-events/',
      icon: 'https://www.google.com/s2/favicons?domain=www.packers.com&sz=128',
      tm: { id: 'KovZpa3awe', match: 'lambeau field', fallbackUrl: 'https://www.packers.com/schedule/', exclude: /parking|tour|hall of fame/i },
      alias: /lambeau field/i,
    },
    'Resch Expo': {
      geo: [44.49987, -88.05581],
      capacity: 7000,
      type: 'community',
      cssVar: '--v-expo',
      color: '#eae186',
      url: 'https://www.reschexpo.com/events',
      icon: 'https://www.google.com/s2/favicons?domain=www.reschexpo.com&sz=128',
      tm: { id: 'KovZ917AY1x', match: 'resch expo', fallbackUrl: 'https://www.reschexpo.com/events', exclude: /parking/i },
      alias: /resch expo/i,
    },
    'Meyer Theatre': {
      geo: [44.51373, -88.01623],
      capacity: 1000,
      type: 'arts',
      cssVar: '--v-meyer',
      color: '#86d5ea',
      url: 'https://meyertheatre.org/events/',
      icon: 'https://www.google.com/s2/favicons?domain=meyertheatre.org&sz=128',
      tm: { id: 'KovZ917Aam0', match: 'meyer theatre', fallbackUrl: 'https://meyertheatre.org/events/' },
      alias: /meyer theat/i,
    },
    // --- Music rooms and the Fox Cities (`area: 'town'`): the EPIC and the Riverside in town, then Appleton and Oshkosh down the river ---
    'EPIC Event Center': {
      geo: [44.4949, -88.0696],
      area: 'town',
      capacity: 2200,
      type: 'concert',
      cssVar: '--v-epic',
      color: '#ea86b8',
      url: 'https://www.epiceventcentergb.com/',
      icon: 'https://www.google.com/s2/favicons?domain=www.epiceventcentergb.com&sz=128',
      tm: { id: 'Z7r9jZa7bR', match: 'epic event center', fallbackUrl: 'https://www.epiceventcentergb.com/' },
      alias: /epic event cent/i,
    },
    'Riverside Ballroom': {
      geo: [44.50487, -87.98704],
      area: 'town',
      capacity: 1500,
      type: 'concert',
      cssVar: '--v-riverside',
      color: '#9aea86',
      url: 'https://www.riversideballroom.com/',
      icon: 'https://www.google.com/s2/favicons?domain=www.riversideballroom.com&sz=128',
      tm: { id: 'KovZpZAal6tA', match: 'riverside ballroom', fallbackUrl: 'https://www.riversideballroom.com/' },
      alias: /riverside ballroom/i,
    },
    'Fox Cities P.A.C.': {
      geo: [44.26256, -88.41178],
      area: 'town',
      capacity: 2072,
      type: 'arts',
      cssVar: '--v-foxpac',
      color: '#8e86ea',
      url: 'https://foxcitiespac.com/events-tickets/',
      icon: 'https://www.google.com/s2/favicons?domain=foxcitiespac.com&sz=128',
      tm: { id: 'KovZpa3aIe', match: 'fox cities', fallbackUrl: 'https://foxcitiespac.com/events-tickets/' },
      alias: /fox cities p(erforming|\.a\.c)/i,
    },
    'Oshkosh Arena': {
      area: 'town',
      capacity: 3500,
      type: 'concert',
      cssVar: '--v-oshkosh',
      color: '#eaab86',
      url: 'https://www.oshkosharena.com/events',
      icon: 'https://www.google.com/s2/favicons?domain=www.oshkosharena.com&sz=128',
      tm: { id: 'KovZ917AxCG', match: 'oshkosh arena', fallbackUrl: 'https://www.oshkosharena.com/events' },
      alias: /oshkosh arena/i,
    },
    // the Wisconsin Timber Rattlers' park (Midwest League), Grand Chute
    'Fox Cities Stadium': {
      geo: [44.2618, -88.4152],
      area: 'town',
      capacity: 5900,
      type: 'sports',
      cssVar: '--v-rattlers',
      color: '#86eac8',
      url: 'https://www.milb.com/wisconsin/schedule',
      icon: 'https://www.google.com/s2/favicons?domain=www.milb.com&sz=128',
      tm: { id: 'ZFr9jZdav7', match: 'fox cities stadium', fallbackUrl: 'https://www.milb.com/wisconsin/schedule', exclude: /parking/i },
      alias: /fox cities stadium|neuroscience group field/i,
    },
  };

  // The usual view: every room on — nothing here lists nightly bar programs
  var DEFAULT_ON = ['Resch Center', 'Lambeau Field', 'Resch Expo', 'Meyer Theatre', 'EPIC Event Center', 'Riverside Ballroom', 'Fox Cities P.A.C.', 'Oshkosh Arena', 'Fox Cities Stadium'];
  var DEFAULT_OFF = [];
  var PREFS_KNOWN_FROM = null; // no default-off venue yet, so nothing for saved prefs to be told about

  // Event types: every event lands in exactly one, from its flags, title,
  // then venue. The rows the panel shows, in order.
  var TYPES = [
    { key: 'concert', label: 'Concerts', title: 'Live music — arena tours to club nights' },
    { key: 'sports', label: 'Sports', title: 'Packers, Gamblers and Phoenix home games, the Timber Rattlers' },
    { key: 'arts', label: 'Arts & Theater', title: 'The Meyer, the Fox Cities P.A.C., Broadway tours, comedy, dance' },
    { key: 'community', label: 'Community', title: 'The Resch Expo shows, festivals, family days' },
  ];
  var MOVIE_VENUE = null; // no cinema here

  // Share codes (?f=CODE): REGISTRY is every filterable key in a fixed
  // order and a code is a bitmask over it, so the list is APPEND-ONLY —
  // adding an entry adds a bit and every existing code keeps meaning what
  // it meant; removing or reordering one changes every link out there.
  // 22 slots from the first build: five base-36 digits.
  var CODE_LENGTH = 5;
  var REGISTRY = [
    ['venue', 'Resch Center'], ['venue', 'Lambeau Field'], ['venue', 'Resch Expo'], ['venue', 'Meyer Theatre'], ['venue', 'EPIC Event Center'], ['venue', 'Riverside Ballroom'], ['venue', 'Fox Cities P.A.C.'], ['venue', 'Oshkosh Arena'], ['venue', 'Fox Cities Stadium'],
    ['badge', 'concert'], ['badge', 'sports'], ['badge', 'arts'], ['badge', 'community'],
    ['team', 'packers'], ['team', 'gamblers'], ['team', 'phoenix'], ['team', 'brewers'], ['team', 'bucks'],
    ['cap', 'stadium'], ['cap', 'arena'], ['cap', 'hall'], ['cap', 'room'],
  ];

  // The words the page uses for the place
  var WORDS = {
    teamCity: 'Green Bay', // the board drops it from the clubs' names ("Green Bay Packers" → Packers)
    presetDefault: 'Every room — Lambeau, the Resch Center, the Meyer, the music rooms and the Fox Cities — every team and type',
    presetNeighborhood: 'Downtown and the stadiums only',
    presetBig: 'Only the places that hold 2,000 or more — Lambeau, the Resch Center and Expo, the big rooms down the river',
    phrases: { all: 'Showing everything.', none: 'Showing nothing yet — open Filter and pick some venues.', neighborhood: 'Showing downtown and the stadiums only.', big: 'Showing the big rooms only — Lambeau, the Resch Center and Expo, the big rooms down the river.' },
  };

  global.LQACity = {
    key: 'greenbay',
    name: 'Green Bay',
    site: 'https://greenbay.here.events/',
    userAgent: 'Mozilla/5.0 (compatible; greenbay-events/1.0; +https://greenbay.here.events/)',
    tz: 'America/Chicago', tzName: 'Central', // the city's time zone: the ICS feed's TZID, the game clocks, the poster's footer
    state: "Wisconsin", stateOutline: 'M8.9 21.9L8.8 21.5L8.0 21.1L7.5 20.4L7.4 19.5L7.5 18.7L7.3 18.4L7.2 18.1L7.0 16.6L6.7 15.8L5.8 15.2L5.2 14.5L4.5 13.9L4.0 13.7L3.6 13.3L3.0 13.1L2.7 12.7L2.6 12.3L2.7 11.7L2.7 11.1L2.7 10.4L2.9 9.8L2.7 9.3L2.3 8.9L2.6 8.3L2.9 7.8L3.8 7.3L4.1 7.1L4.1 5.9L4.1 4.7L4.4 4.5L4.6 4.3L5.4 4.2L6.1 3.8L7.1 3.2L8.3 2.4L9.4 2.0L10.4 2.1L10.7 2.5L10.4 3.2L10.1 3.9L9.7 4.6L9.6 5.2L9.8 5.2L10.1 5.3L10.3 5.7L10.4 6.0L11.2 6.2L11.9 6.4L12.6 6.6L13.3 6.8L13.8 7.1L14.2 7.3L14.8 7.4L15.6 7.5L16.3 7.8L16.3 8.2L17.1 8.6L17.2 8.9L17.2 9.2L17.0 9.7L17.0 10.0L17.1 10.1L17.5 10.0L17.6 10.1L17.4 10.6L17.5 10.9L18.2 11.3L18.8 10.4L19.7 9.7L21.1 10.2L21.3 11.0L20.4 12.2L19.8 14.2L19.3 16.2L19.1 17.5L19.2 19.8L19.4 22.0L16.8 22.0L14.2 22.0L11.5 21.9L8.9 21.9Z', // the masthead's small state, linking to here.events (scripts/state-outline.mjs, Natural Earth 1:50m)
    // the calendar feed's header; the UID domain never changes (changing it
    // re-creates every event in subscribers' calendars)
    ics: { name: 'Green Bay Events', short: 'Green Bay Events', teams: 'Green Bay home teams — every season', prodid: '-//here.events//greenbay-events//EN', uidDomain: 'fosdal.net', // the UID domain the whole family issues (the shared ics test pins it)
      desc: 'Upcoming events around Green Bay\\, WI — Lambeau Field\\, the Resch Center\\, the Meyer Theatre\\, the music rooms and the Fox Cities' },
    teams: TEAMS,
    map: { // the Map view (local-map.js; the ground drawn once by scripts/build-local-map.mjs from OpenStreetMap, committed as site/local-map.json) — every city gets one, Steve, 2026-10-26
      kind: 'urban',
      bbox: [44.224, -88.479, 44.552, -87.923], // south, west, north, east — every room, with a margin
      home: [44.492, -88.074, 44.522, -88.005], // the view at first: the city's own rooms; the fit button shows the whole frame
      roads: ['motorway', 'trunk', 'primary'],
      tolerance: 0.6,
      labels: [
        { name: 'Green Bay', lat: 44.513, lon: -88.013, anchor: 'middle' },
        { name: 'Ashwaubenon', lat: 44.47526, lon: -88.06073, anchor: 'middle' },
        { name: 'Appleton', lat: 44.2614, lon: -88.40697, anchor: 'middle' },
      ],
    },
    venues: VENUES,
    defaultOn: DEFAULT_ON,
    defaultOff: DEFAULT_OFF,
    prefsKnownFrom: PREFS_KNOWN_FROM,
    types: TYPES,
    movieVenue: MOVIE_VENUE,
    groundsVenue: null, // every listing is read by room, so nothing arrives under a name city.js lacks
    codeLength: CODE_LENGTH,
    registry: REGISTRY,
    words: WORDS,
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
