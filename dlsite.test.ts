import { afterEach, describe, expect, it } from 'vitest'
import { parserLoader, resetPage, visit } from '#scraper-test'

// The parser, evaluated with the helpers it is injected with, as a scrape runs it.
const load = parserLoader(__dirname)

afterEach(resetPage)

describe('dLsite', () => {
  it('reads a DLsite work as its picture and description, its circle, price and genres as its details', () => {
    const { parseDLsite } = load('dlsite.js', ['parseDLsite'])
    const ld = { '@type': 'Product', 'name': 'A work', 'brand': { '@type': 'Brand', 'name': 'Rabbit Club', 'url': 'https://www.dlsite.com/maniax/circle/profile/=/maker_id/RG01033909.html' }, 'offers': { price: '1496', priceCurrency: 'JPY' }, 'image': ['https://img.dlsite.jp/a_img_main.jpg'] }
    visit('https://www.dlsite.com/maniax/work/=/product_id/RJ01719745.html', `<script type="application/ld+json">${JSON.stringify(ld)}</script><h1 id="work_name"> A work </h1>
      <section class="c-productContent"><div class="headline"><h3 class="headline__title">A heading</h3></div><div class="c-productContent__text">One<br>Two</div></section>
      <dl><dd class="c-productInfo__value"><a href="/maniax/fsr/=/genre/312/from/work.genre/">きせかえ</a></dd></dl>`)
    expect(parseDLsite()).toEqual({
      title: 'A work',
      content: ['![](https://img.dlsite.jp/a_img_main.jpg)', '### A heading', 'One\nTwo'],
      links: [
        { url: 'https://www.dlsite.com/maniax/circle/profile/=/maker_id/RG01033909.html', title: 'Rabbit Club', score: 1 },
        { url: 'https://www.dlsite.com/maniax/fsr/=/genre/312/from/work.genre/', title: 'きせかえ', score: 0.5 },
      ],
      details: [
        ['circle', { text: 'Rabbit Club', url: 'https://www.dlsite.com/maniax/circle/profile/=/maker_id/RG01033909.html' }],
        ['price', '1496 JPY'],
        ['released', null],
        ['kind', []],
        ['genres', [{ text: 'きせかえ', url: 'https://www.dlsite.com/maniax/fsr/=/genre/312/from/work.genre/' }]],
        ['creators', []],
      ],
    })
  })

  it('reads https://www.dlsite.com/maniax/ as a listing of what it links to', async () => {
    const { parseDLsite } = load('dlsite.js', ['parseDLsite'])
    visit('https://www.dlsite.com/maniax/', '<a href="/maniax/work/=/product_id/RJ01719745.html">A</a><a href="/maniax/genre/list/">B</a>')
    expect(await parseDLsite()).toEqual({ listing: true, links: [{ url: 'https://www.dlsite.com/maniax/work/=/product_id/RJ01719745.html', score: 1 }] })
  })
})
