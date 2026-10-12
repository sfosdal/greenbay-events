# Green Bay Events

Event feed and calendar for Green Bay: Lambeau Field, the Resch Center and
Expo, the Meyer Theatre, the EPIC Event Center and the Riverside Ballroom, and
the Fox Cities down the river (the Fox Cities P.A.C., the Oshkosh Arena, the
Timber Rattlers' park) — with the home teams' seasons (Packers, Gamblers,
Phoenix, and the Brewers and Bucks in Milwaukee) in a Teams view.

Live at **https://greenbay.here.events/** once the domain is wired (GitHub
Pages, built by the Actions workflow once a day at noon Central).

A city on the lqa-events codebase, built from the Chicago copy: everything
that makes this Green Bay's is `site/city.js` (every team, venue, type,
default, share-code registry and string), `site/index.html`,
`scripts/fetch-events.mjs` (the sources), `site/embed.js`, `outlook.json`,
`scripts/data/postseason.json`, `channels.json`, the manifest and icons (a
green-and-gold mark, rendered from `favicon.svg`). Everything else is
lqa-events' own, byte for byte — copy from there, never edit here.

## Embed

```html
<div id="greenbay-events"></div>
<script src="https://greenbay.here.events/embed.js" data-max="8" defer></script>
```

## Sources

- **Ticketmaster Discovery API** — every room by its venue id (every page):
  nine rooms, from Lambeau to the Fox Cities. No city sweep. The key is
  shared by every here.events calendar, so each call is paced a second apart
  and backs off on a 429. Church events are left out (`isChurch`).
- **Seasons** — ESPN for the Packers, the Phoenix and the Bucks; MLB's stats
  API for the Brewers; HockeyTech's USHL feed for the Gamblers
  (`scripts/schedules.mjs`, shared with lqa). The Brewers and the Bucks are
  Teams-view only: their home buildings are no venue of this calendar.

Next to add: the rooms whose shows Ticketmaster never lists (the Weidner
Center, the Tarlton, the Meyer's Backstage, the Oneida Casino), Capital
Credit Union Park once the Rockers' season is listed, and the city's
festivals.

## Local run

```sh
cp .env.example .env   # TICKETMASTER_API_KEY=…
ALLOW_NO_ARCHIVE=1 node scripts/fetch-events.mjs   # ALLOW_NO_ARCHIVE only until the site has published once
node --test scripts/*.test.mjs
```
