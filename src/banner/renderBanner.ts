import type { BannerSize, Campaign, EndFrameLayout, Product, Rect } from '../types'
import { keyframes, makePlan, type Motion, type Segment } from './timeline'

/**
 * Bir boyut için bağımsız (self-contained) GDN HTML5 banner üretir.
 *
 * `resolve` görsel anahtarını (bg, logo, p0, p1, p2) src değerine çevirir:
 *  - önizlemede data URL,
 *  - export'ta ZIP içindeki dosya adı ("p0.png" gibi).
 */
export type AssetKey = 'bg' | 'logo' | `p${number}`
export type Resolve = (key: AssetKey) => string | null

export function renderBanner(c: Campaign, size: BannerSize, resolve: Resolve): string {
  const products = c.products.slice(0, 3)
  const n = products.length
  const endLayout = n >= 2 ? size.endFrame[n as 2 | 3] : null
  const plan = makePlan(n, !!endLayout)
  const T = plan.loopDuration

  const css: string[] = []
  let kfId = 0
  /** animasyonlu öğe için style + keyframes üretir */
  const anim = (seg: Segment, delay: number, motion: Motion) => {
    const name = `a${kfId++}`
    css.push(keyframes(name, seg, delay, motion, T))
    return `animation:${name} ${T}s ease-out ${plan.loops} both;`
  }

  const body: string[] = []

  // Arka plan
  const bg = resolve('bg')
  body.push(
    `<div class="bg" style="${bg ? `background-image:url('${bg}');` : ''}"></div>`,
  )

  // Logo (tüm karelerde sabit)
  const logo = resolve('logo')
  if (logo) {
    body.push(
      `<img class="logo" src="${logo}" alt="" style="${box(size.frame.logo)}">`,
    )
  }

  // Ürün kareleri
  products.forEach((p, i) => {
    body.push(productFrame(p, i, size, plan.frames[i], resolve, anim, c.ctaText))
  })

  // Kapanış karesi
  if (endLayout && plan.endFrame) {
    body.push(endFrame(products, endLayout, plan.endFrame, resolve, anim, c.ctaText))
  }

  const f = size.fonts
  const col = c.colors
  const baseCss = `
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${size.width}px;height:${size.height}px;overflow:hidden}
body{font-family:Arial,Helvetica,sans-serif;color:${col.text};-webkit-font-smoothing:antialiased}
a#ad{position:absolute;inset:0;display:block;overflow:hidden;color:inherit;text-decoration:none;cursor:pointer;
  width:${size.width}px;height:${size.height}px;border:1px solid rgba(0,0,0,.15)}
.bg{position:absolute;inset:0;background:linear-gradient(135deg,${col.bg},${col.bg2});background-size:cover;background-position:center}
.el{position:absolute}
.logo{position:absolute;object-fit:contain;object-position:left center}
.img{object-fit:contain;filter:drop-shadow(0 ${Math.round(size.height / 60) + 2}px ${Math.round(size.height / 30) + 4}px rgba(0,0,0,.28))}
.info{display:flex;flex-direction:column;justify-content:flex-end;overflow:hidden}
.name{font-size:${f.name}px;font-weight:700;line-height:1.15;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.model{font-size:${f.model}px;line-height:1.25;opacity:.8;margin-top:2px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.price{font-size:${f.price}px;font-weight:800;color:${col.accent};white-space:nowrap;line-height:1.1;display:flex;align-items:center}
.feats{list-style:none;font-size:${f.feature}px;line-height:1.3;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-start}
.feats li{position:relative;padding-left:1.25em;margin-bottom:.3em}
.feats li:before{content:"";position:absolute;left:0;top:.35em;width:.55em;height:.3em;border-left:2px solid ${col.accent};border-bottom:2px solid ${col.accent};transform:rotate(-45deg)}
.cta{display:flex;align-items:center;justify-content:center;background:${col.accent};color:${col.ctaText};
  font-size:${f.cta}px;font-weight:700;border-radius:999px;white-space:nowrap;letter-spacing:.02em}
.center{text-align:center;align-items:center}
.center.feats{align-items:center}
.center.feats li{padding-left:0}
.center.feats li:before{position:relative;display:inline-block;top:-.2em;margin-right:.45em}
.center.price{justify-content:center}
.cell-name{font-weight:700;line-height:1.15;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.cell-price{font-weight:800;color:${col.accent};white-space:nowrap;margin-top:.2em}
`

  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="ad.size" content="width=${size.width},height=${size.height}">
<title>${esc(c.campaignName)} ${size.id}</title>
<script type="text/javascript">var clickTag = "${escJs(c.clickUrl)}";</script>
<style>${baseCss}${css.join('\n')}</style>
</head>
<body>
<a id="ad" href="javascript:window.open(window.clickTag)">
${body.join('\n')}
</a>
</body>
</html>`
}

// ---------- kareler ----------

function productFrame(
  p: Product,
  i: number,
  size: BannerSize,
  seg: Segment,
  resolve: Resolve,
  anim: (s: Segment, d: number, m: Motion) => string,
  ctaText: string,
): string {
  const L = size.frame
  const center = L.align === 'center'
  const cls = center ? ' center' : ''
  const out: string[] = []
  const src = resolve(`p${i}`)
  if (src) {
    out.push(
      `<img class="el img" src="${src}" alt="" style="${box(L.image)}${anim(seg, 0, 'right')}">`,
    )
  }
  out.push(
    `<div class="el info${cls}" style="${box(L.info)}${anim(seg, 0.25, 'up')}">` +
      (p.name ? `<div class="name">${esc(p.name)}</div>` : '') +
      (p.model ? `<div class="model">${esc(p.model)}</div>` : '') +
      `</div>`,
  )
  if (p.price) {
    out.push(
      `<div class="el price${cls}" style="${box(L.price)}${anim(seg, 0.45, 'zoom')}">${esc(p.price)}</div>`,
    )
  }
  const feats = p.features.filter((f) => f.trim()).slice(0, 3)
  if (feats.length) {
    // Her özellik kendi gecikmesiyle sırayla gelir
    const items = feats
      .map((f, k) => `<li style="${anim(seg, 0.7 + k * 0.18, 'left')}">${esc(f)}</li>`)
      .join('')
    out.push(`<ul class="el feats${cls}" style="${box(L.features)}">${items}</ul>`)
  }
  if (ctaText) {
    out.push(
      `<div class="el cta" style="${box(L.cta)}${anim(seg, 1.1, 'zoom')}">${esc(ctaText)}</div>`,
    )
  }
  return out.join('\n')
}

function endFrame(
  products: Product[],
  L: EndFrameLayout,
  seg: Segment,
  resolve: Resolve,
  anim: (s: Segment, d: number, m: Motion) => string,
  ctaText: string,
): string {
  const n = products.length
  const out: string[] = []
  const a = L.area
  const cellW = L.direction === 'row' ? (a.w - L.gap * (n - 1)) / n : a.w
  const cellH = L.direction === 'col' ? (a.h - L.gap * (n - 1)) / n : a.h

  products.forEach((p, i) => {
    const x = L.direction === 'row' ? a.x + i * (cellW + L.gap) : a.x
    const y = L.direction === 'col' ? a.y + i * (cellH + L.gap) : a.y
    const fN = L.fonts.name
    const fP = L.fonts.price
    const textH = fN * 2.4 + fP * 1.45
    const src = resolve(`p${i}`)
    const d = 0.1 + i * 0.15

    let imgR: Rect
    let txtR: Rect
    let align = 'center'
    if (L.cell === 'stack') {
      imgR = { x, y, w: cellW, h: Math.max(10, cellH - textH) }
      txtR = { x, y: y + cellH - textH, w: cellW, h: textH }
    } else {
      const iw = Math.round(cellW * 0.5)
      imgR = { x, y, w: iw, h: cellH }
      txtR = { x: x + iw + 6, y, w: cellW - iw - 6, h: cellH }
      align = 'left'
    }
    if (src) {
      out.push(`<img class="el img" src="${src}" alt="" style="${box(imgR)}${anim(seg, d, 'zoom')}">`)
    }
    out.push(
      `<div class="el" style="${box(txtR)}display:flex;flex-direction:column;justify-content:center;text-align:${align};${anim(seg, d + 0.2, 'up')}">` +
        `<div class="cell-name" style="font-size:${fN}px">${esc(p.name || p.model)}</div>` +
        (p.price ? `<div class="cell-price" style="font-size:${fP}px">${esc(p.price)}</div>` : '') +
        `</div>`,
    )
  })
  if (ctaText) {
    out.push(`<div class="el cta" style="${box(L.cta)}${anim(seg, 0.6, 'zoom')}">${esc(ctaText)}</div>`)
  }
  return out.join('\n')
}

// ---------- yardımcılar ----------

const r = (v: number) => Math.round(v * 10) / 10
const box = (b: Rect) => `left:${r(b.x)}px;top:${r(b.y)}px;width:${r(b.w)}px;height:${r(b.h)}px;`

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

/** Bir boyutta her görselin ekranda kapladığı en büyük alan (export'ta yeniden boyutlandırma için) */
export function maxImageBox(size: BannerSize, productCount: number): { w: number; h: number } {
  let w = size.frame.image.w
  let h = size.frame.image.h
  const e = productCount >= 2 ? size.endFrame[productCount as 2 | 3] : null
  if (e) {
    w = Math.max(w, e.direction === 'row' ? e.area.w / productCount : e.area.w)
    h = Math.max(h, e.direction === 'col' ? e.area.h / productCount : e.area.h)
  }
  return { w: Math.ceil(w), h: Math.ceil(h) }
}
