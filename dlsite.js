// A work's own address on DLsite, /<floor>/work/=/product_id/<id>.html, else null.
function dlsiteWork(url) {
  const page = new URL(url, location.href)
  const path = /^\/[\w-]+\/work\/=\/product_id\/[A-Z]{2}\d+\.html/.exec(page.pathname)?.[0]
  return /(?:^|\.)dlsite\.com$/.test(page.hostname) && path ? `${page.origin}${path}` : null
}

// A work's page (/maniax/work/=/product_id/RJ01719745.html) reads as its name, its main picture (its JSON-LD's first
// image), then each section of its description ("作品内容"): its heading, then its text and pictures (see lineBlocks).
// Its details are its circle (its JSON-LD brand, the maker), price, release date, kind of work, genres and creators
// (illustrators, voice actors…), each a link to the listing of it where the page gives one; it links with weight 1 to
// its circle's page and with 0.5 to its genres' and creators' listings. Any other page (a floor's home page, a ranking,
// a search, a circle's page) is a listing of the works it shows.
function parseDLsite(_profileId) {
  if (!/(?:^|\.)dlsite\.com$/.test(location.hostname)) {
    return null
  }
  const work = dlsiteWork(location.href)
  const [product] = jsonLd('Product')
  const title = document.querySelector('#work_name')?.textContent.trim() || product?.name
  if (!work || !title) {
    return listingOf(linkUrls('a[href*="/product_id/"]').map(dlsiteWork).filter(url => url && url !== work)) ?? { listing: true }
  }
  const main = [product?.image].flat()[0]
  const content = main ? [`![](${new URL(main, location.href).href})`] : []
  for (const section of document.querySelectorAll('.c-productContent')) {
    const heading = section.querySelector('.headline__title')?.textContent.trim()
    if (heading) {
      content.push(`### ${heading}`)
    }
    content.push(...lineBlocks(section, { skip: '.headline' }))
  }
  const brand = product?.brand?.name && { text: product.brand.name, url: product.brand.url }
  const circle = namedLinks('.c-productInfo__makerName[href]')[0] || brand || null
  const genres = namedLinks('.c-productInfo__value a[href*="/genre/"]')
  const creators = namedLinks('.c-productInfo__value a[href*="keyword_creater"]')
  const price = product?.offers?.price && `${product.offers.price} ${product.offers.priceCurrency || ''}`.trim()
  const links = new Map(circle?.url ? [[circle.url, { url: circle.url, title: circle.text, score: 1 }]] : [])
  for (const { text, url } of [...genres, ...creators]) {
    if (!links.has(url)) {
      links.set(url, { url, title: text, score: 0.5 })
    }
  }
  return {
    title,
    content,
    links: [...links.values()],
    details: [
      ['circle', circle],
      ['price', price || null],
      ['released', document.querySelector('.c-productInfo__value a[href*="/new/=/year/"]')?.textContent.trim() || null],
      ['kind', namedLinks('.c-productInfo__value a[href*="/work_type/"]')],
      ['genres', genres],
      ['creators', creators],
    ],
  }
}

// The parser a scrape calls.
registerParser(parseDLsite)
