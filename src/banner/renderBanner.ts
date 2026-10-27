import type { BannerSize, Campaign, Rect } from '../types'
import { layoutProducts, settingsFor } from './layout'
import { getLogo, svgAspect } from './logos'
import { KEYFRAMES, TIMING, enter } from './timeline'

/**
 * Bir boyut için bağımsız (self-contained) GDN HTML5 banner üretir.
 *
 * `resolve` görsel anahtarını (bg, logo, p0, p1, p2) src değerine çevirir:
 *  - önizlemede data URL,
 *  - export'ta ZIP içindeki dosya adı ("p0.png" gibi).
 */
export type AssetKey = 'bg' | LogoPart | `p${number}`
export type LogoPart = 'logo' | 'logoIcon' | 'logoWord'

/**
 * Banner fontu. GDN, ZIP içinde font dosyasına izin vermez; tek izinli dış
 * kaynak Google Fonts olduğu için font oradan bağlanır.
 */
export const BANNER_FONT = {
  family: 'Saira Semi Condensed',
  weight: 700,
  css: 'https://fonts.googleapis.com/css2?family=Saira+Semi+Condensed:wght@700&display=swap',
}
const FONT_STACK = `'${BANNER_FONT.family}','Arial Narrow',Arial,sans-serif`
export type Resolve = (key: AssetKey) => string | null

export function renderBanner(c: Campaign, size: BannerSize, resolve: Resolve): string {
  const s = settingsFor(c, size)
  const products = c.products.slice(0, 3)
  const slots = layoutProducts(size, c, s)
  const P = size.products
  const col = c.colors
  const W = size.width
  const H = size.height
  const body: string[] = []

  // Arka plan: görsel ya da ürünlerin arkasında parlayan degrade
  const bg = resolve('bg')
  body.push(`<div class="bg"${bg ? ` style="background-image:url('${bg}')"` : ''}></div>`)

  // Logo
  const pos = size.headline.align === 'left' ? 'left center' : 'center'
  for (const part of logoParts(c, size)) {
    const src = resolve(part.key)
    if (!src) continue
    body.push(
      `<img class="el logo" src="${src}" alt="" style="${box(part.rect)}object-position:${pos};${enter('down', TIMING.logo)}">`,
    )
  }

  // Başlık
  const hb = size.headline
  const headLines = (hb.oneLine ? [c.headline.replace(/\s*\n\s*/g, ' ')] : c.headline.split('\n'))
    .map((l) => upper(l.trim()))
    .filter(Boolean)
  if (headLines.length) {
    const font = fitFont(headLines, hb.font, hb.w, hb.h, 1.04)
    body.push(
      `<div class="el head" style="${box(hb)}font-size:${r(font)}px;text-align:${hb.align};justify-content:${hb.align === 'left' ? 'flex-start' : 'center'};${enter('up', TIMING.headline)}">` +
        `<div>${headLines.map(esc).join('<br>')}</div></div>`,
    )
  }

  // Alt metin
  if (size.sub && c.subline.trim()) {
    const sb = size.sub
    body.push(
      `<div class="el sub" style="${box(sb)}font-size:${sb.font}px;text-align:${sb.align};${enter('up', TIMING.sub)}">${esc(c.subline.trim())}</div>`,
    )
  }

  // Laptoplar: öndekiler önce girer
  const order = [...slots].sort((a, b) => b.z - a.z).map((sl) => sl.index)
  slots.forEach((sl) => {
    const src = resolve(`p${sl.index}`)
    if (!src) return
    const d = TIMING.laptop + order.indexOf(sl.index) * TIMING.laptopStep
    body.push(
      `<img class="el img" src="${src}" alt="" style="${box(sl.img)}z-index:${sl.z};${enter('zoom', d)}">`,
    )
  })

  // Özellikler (laptopun altında)
  slots.forEach((sl) => {
    const feats = products[sl.index]?.features.filter((f) => f.trim()).slice(0, 3) ?? []
    if (!sl.features || !feats.length) return
    body.push(
      `<ul class="el feats" style="${box(sl.features)}font-size:${P.fonts.feature}px;z-index:20;${enter('fade', TIMING.features)}">` +
        feats.map((f) => `<li>${esc(f)}</li>`).join('') +
        `</ul>`,
    )
  })

  // Fiyat etiketleri (laptopların üzerinde)
  slots.forEach((sl, k) => {
    const p = products[sl.index]
    if (!sl.tag || !p || (!p.name && !p.price)) return
    const t = sl.tag
    const anchor = t.anchor === 'bottom-center' ? 'transform:translate(-50%,-100%);' : ''
    body.push(
      `<div class="el tagpos" style="left:${r(t.x)}px;top:${r(t.y)}px;${anchor}z-index:${30 + sl.z}">` +
        `<div class="tag" style="font-size:${P.fonts.price}px;transform-origin:${t.anchor === 'bottom-center' ? '50% 100%' : '0 0'};${enter('pop', TIMING.tag + k * TIMING.tagStep)}">` +
        (p.name ? `<span class="badge" style="font-size:${P.fonts.badge}px">${esc(p.name.toUpperCase())}</span>` : '') +
        (p.price ? `<span class="price">${esc(p.price)}</span>` : '') +
        `</div></div>`,
    )
  })

  // Buton
  const cb = size.cta
  const cta = upper(c.ctaText.trim())
  if (cta) {
    const border = Math.max(1, Math.round(cb.h / 22))
    const font = fitFont(cta.split(' ').length > 1 && cb.w < cb.h * 1.6 ? cta.split(' ') : [cta], cb.font, cb.w - border * 2 - cb.h * 0.3, cb.h, 1.1)
    body.push(
      `<div class="el ctapos" style="${box(cb)}z-index:60;${enter('up', TIMING.cta)}">` +
        `<div class="cta" style="font-size:${r(font)}px;border-width:${border}px">${esc(cta)}</div></div>`,
    )
  }

  // Parlamanın merkezi ürün alanının ortası
  const gx = Math.round(((P.area.x + P.area.w / 2) / W) * 100)
  const gy = Math.round(((P.area.y + P.area.h * 0.65) / H) * 100)
  const glowW = Math.round(Math.min(90, (P.area.w / W) * 80 + 10))
  const glowH = Math.round(Math.min(80, (P.area.h / H) * 70 + 10))
  const tagShadow = col.priceBg.length === 7 ? `${col.priceBg}66` : 'rgba(0,0,0,.4)'

  const baseCss = `
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:${col.bg}}
body{font-family:${FONT_STACK};font-weight:${BANNER_FONT.weight};color:${col.text};-webkit-font-smoothing:antialiased}
a#ad{position:absolute;inset:0;display:block;overflow:hidden;color:inherit;text-decoration:none;cursor:pointer;
  width:${W}px;height:${H}px;border:1px solid rgba(255,255,255,.12)}
.bg{position:absolute;inset:0;background:radial-gradient(ellipse ${glowW}% ${glowH}% at ${gx}% ${gy}%,${col.bg2},transparent 72%),${col.bg};background-size:cover;background-position:center}
.el{position:absolute}
.logo{object-fit:contain}
.head{display:flex;align-items:center;line-height:1.04;white-space:nowrap}
.sub{line-height:1.3;opacity:.92;overflow:hidden}
.img{object-fit:contain;object-position:center bottom;filter:drop-shadow(0 ${Math.round(H / 90) + 2}px ${Math.round(H / 45) + 4}px rgba(0,0,0,.55))}
.feats{list-style:none;line-height:1.3;text-align:center;overflow:hidden;opacity:.9}
.feats li{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.feats li:before{content:"";display:inline-block;width:.42em;height:.42em;background:${col.priceBg};margin-right:.4em;vertical-align:.08em}
.tag{display:flex;flex-direction:column;align-items:flex-start;filter:drop-shadow(0 0 .35em ${tagShadow})}
.badge{position:relative;z-index:1;margin-left:1.6em;margin-bottom:-1px;padding:.32em 1.1em .26em .7em;background:${col.badgeBg};color:${col.badgeText};
  font-weight:700;line-height:1;white-space:nowrap;letter-spacing:.02em;clip-path:polygon(0 0,calc(100% - .8em) 0,100% 100%,0 100%)}
.price{display:block;padding:.13em .34em .11em;background:${col.priceBg};color:${col.priceText};font-weight:700;line-height:1.15;white-space:nowrap;
  clip-path:polygon(0 0,calc(100% - .32em) 0,100% .32em,100% 100%,.32em 100%,0 calc(100% - .32em))}
.ctapos{display:flex}
.cta{flex:1;display:flex;align-items:center;justify-content:center;text-align:center;background:${col.ctaBg};color:${col.ctaText};
  border:2px solid ${col.ctaText};font-weight:700;line-height:1.1;letter-spacing:.03em;
  animation:pulse ${TIMING.pulseDur}s ease-in-out ${TIMING.pulseStart}s ${TIMING.pulseCount}}
${Object.values(KEYFRAMES).join('\n')}
`

  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="ad.size" content="width=${W},height=${H}">
<title>${esc(c.campaignName)} ${size.id}</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${BANNER_FONT.css}">
<script type="text/javascript">var clickTag = "${escJs(c.clickUrl)}";</script>
<style>${baseCss}</style>
</head>
<body>
<a id="ad" href="javascript:window.open(window.clickTag)">
${body.join('\n')}
</a>
</body>
</html>`
}

// ---------- yardımcılar ----------

/** Seçili logonun bu boyutta kullanılan parçaları ve kutuları */
export function logoParts(c: Campaign, size: BannerSize): { key: LogoPart; rect: Rect }[] {
  const logo = getLogo(c.logoId)
  if (!logo) return []
  const L = size.logo
  if (size.logoMode === 'icon') return [{ key: 'logoIcon', rect: L }]
  if (size.logoMode === 'full') return [{ key: 'logo', rect: L }]
  // stacked: yazı tam genişlikte altta, ikon kalan yükseklikte üstte
  const gap = Math.round(L.h * 0.05)
  const wordH = Math.min(L.w / svgAspect(logo.word), L.h * 0.4)
  return [
    { key: 'logoIcon', rect: { x: L.x, y: L.y, w: L.w, h: L.h - wordH - gap } },
    { key: 'logoWord', rect: { x: L.x, y: L.y + L.h - wordH, w: L.w, h: wordH } },
  ]
}

const r = (v: number) => Math.round(v * 10) / 10
const box = (b: Rect) => `left:${r(b.x)}px;top:${r(b.y)}px;width:${r(b.w)}px;height:${r(b.h)}px;`
const upper = (s: string) => s.toLocaleUpperCase('tr-TR')

/** Font yüklenmeden önce kullanılan tahmini karakter genişlikleri (em, Saira Semi Condensed Bold) */
function charW(ch: string): number {
  if (' ,.:;!\'|'.includes(ch)) return 0.24
  if ('Iİ'.includes(ch)) return 0.26
  if ('MW'.includes(ch)) return 0.78
  if ('J'.includes(ch)) return 0.46
  if (/[0-9]/.test(ch)) return 0.52
  if ('%&'.includes(ch)) return 0.7
  if (/[a-zçğıöşü]/.test(ch)) return 0.5
  return 0.58
}

/** Banner fontu sayfada gerçekten yüklendi mi (check() tanımsız fontta da true döner) */
export function bannerFontLoaded(): boolean {
  if (typeof document === 'undefined' || !document.fonts) return false
  return [...document.fonts].some(
    (f) => f.family.replace(/['"]/g, '') === BANNER_FONT.family && f.status === 'loaded',
  )
}

let measureCtx: CanvasRenderingContext2D | null | undefined
/** Metnin 1px yazı boyutundaki genişliği; font yüklüyse canvas ile gerçek ölçüm */
function textW(s: string): number {
  const spec = `${BANNER_FONT.weight} 100px '${BANNER_FONT.family}'`
  if (bannerFontLoaded()) {
    if (measureCtx === undefined) measureCtx = document.createElement('canvas').getContext('2d')
    if (measureCtx) {
      measureCtx.font = spec
      return measureCtx.measureText(s).width / 100
    }
  }
  return [...s].reduce((t, ch) => t + charW(ch), 0)
}

/** Satırların kutuya sığacağı en büyük yazı boyutu (en fazla `max`) */
function fitFont(lines: string[], max: number, w: number, h: number, lh: number): number {
  const widest = Math.max(...lines.map(textW), 0.01)
  return Math.max(4, Math.min(max, w / widest, h / (lines.length * lh)))
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
function escJs(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/</g, '\\x3c')
}

/** Bir boyutta her ürün görselinin ekranda kapladığı en büyük alan (export'ta yeniden boyutlandırma için) */
export function maxImageBox(c: Campaign, size: BannerSize): { w: number; h: number } {
  const slots = layoutProducts(size, c, settingsFor(c, size))
  const w = Math.max(1, ...slots.map((s) => s.img.w))
  const h = Math.max(1, ...slots.map((s) => s.img.h))
  return { w: Math.ceil(w), h: Math.ceil(h) }
}
