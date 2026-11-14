# DLsite scraper for Localnet

Reads `dlsite.com` pages for Localnet, a browser extension that is a personal search engine.
Localnet pulls it from here the first time it scrapes such a page, through the
[localnet-scrapers](https://github.com/opowell/localnet-scrapers) scraper source.

A work's page (/maniax/work/=/product_id/RJ01719745.html) reads as its name, its main picture (its JSON-LD's first image), then each section of its description ("作品内容"): its heading, then its text and pictures (see lineBlocks). Its details are its circle (its JSON-LD brand, the maker), price, release date, kind of work, genres and creators (illustrators, voice actors…), each a link to the listing of it where the page gives one; it links with weight 1 to its circle's page and with 0.5 to its genres' and creators' listings. Any other page (a floor's home page, a ranking, a search, a circle's page) is a listing of the works it shows.

- `source.json`: what Localnet reads to know the scraper: its name, the URLs it reads, and the file to run.
- `dlsite.js`: the parser. It is injected into the scraped page after Localnet's DOM helpers (content-scripts/utils/dom.js) and defines `window.__dynamicParser`.
- `dlsite.test.ts`: its unit tests, run from a Localnet checkout (`pnpm parsers pull`, then `pnpm test parsers/localnet-scraper-dlsite`).
- `saved-pages/` (not in git): real pages saved from the site, which Localnet's `e2e/saved-pages.test.ts` scrapes. See Localnet's README.