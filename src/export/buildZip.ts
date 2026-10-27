import JSZip from 'jszip'
import type { BannerSize, Campaign } from '../types'
import { maxImageBox, renderBanner, type AssetKey } from '../banner/renderBanner'
import { PLACEHOLDER_HUES, placeholderLaptopSvg } from '../banner/placeholder'
import { coverJpeg, dataUrlToBytes, fitPng, isSvg, loadImage } from './images'

/** Google Ads HTML5 limitleri */
export const GDN_LIMITS = { maxZipBytes: 150 * 1024, maxFiles: 40 }

/**
 * Sıkıştırma kademeleri. Bir boyutun ZIP'i 150 KB'ı aşarsa bir sonraki
 * (daha agresif) kademe denenir.
 */
const LEVELS = [
  { scale: 2, colors: 256, jpeg: 0.85 },
  { scale: 1.5, colors: 256, jpeg: 0.8 },
  { scale: 1.25, colors: 256, jpeg: 0.75 },
  { scale: 1, colors: 256, jpeg: 0.7 },
  { scale: 1, colors: 128, jpeg: 0.6 },
  { scale: 1, colors: 64, jpeg: 0.5 },
]

export interface SizeResult {
  size: BannerSize
  zip: Uint8Array
  bytes: number
  files: number
  level: number
  ok: boolean
  warnings: string[]
}

/** Ürün görseli (yüklenmediyse yer tutucu SVG) */
export function productSrc(c: Campaign, i: number): string {
  const p = c.products[i]
  if (p?.image) return p.image
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(placeholderLaptopSvg(PLACEHOLDER_HUES[i % 3]))
}

export async function buildSizeZip(c: Campaign, size: BannerSize, startLevel = 1): Promise<SizeResult> {
  const n = c.products.length
  const imgBox = maxImageBox(c, size)
  // Görselleri bir kere yükle
  const productImgs = await Promise.all(c.products.map((_, i) => loadImage(productSrc(c, i))))
  const bgImg = c.background ? await loadImage(c.background) : null
  const logoImg = c.logo && !isSvg(c.logo) ? await loadImage(c.logo) : null

  let last: SizeResult | null = null
  for (let lv = startLevel; lv < LEVELS.length; lv++) {
    const L = LEVELS[lv]
    const zip = new JSZip()
    const names: Partial<Record<AssetKey, string>> = {}

    // Ürünler
    for (let i = 0; i < n; i++) {
      const src = productSrc(c, i)
      if (isSvg(src)) {
        names[`p${i}`] = `p${i}.svg`
        zip.file(`p${i}.svg`, dataUrlToBytes(src))
      } else {
        names[`p${i}`] = `p${i}.png`
        zip.file(`p${i}.png`, fitPng(productImgs[i], imgBox.w * L.scale, imgBox.h * L.scale, L.colors))
      }
    }
    // Arka plan
    if (bgImg) {
      names.bg = 'bg.jpg'
      zip.file('bg.jpg', await coverJpeg(bgImg, size.width * Math.min(L.scale, 1.5), size.height * Math.min(L.scale, 1.5), L.jpeg))
    }
    // Logo
    if (c.logo) {
      if (isSvg(c.logo)) {
        names.logo = 'logo.svg'
        zip.file('logo.svg', dataUrlToBytes(c.logo))
      } else if (logoImg) {
        names.logo = 'logo.png'
        zip.file('logo.png', fitPng(logoImg, size.logo.w * L.scale, size.logo.h * L.scale, L.colors))
      }
    }

    const html = renderBanner(c, size, (k) => names[k] ?? null)
    zip.file('index.html', html)

    const bytes = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE', compressionOptions: { level: 9 } })
    const files = Object.keys(zip.files).length
    const ok = bytes.length <= GDN_LIMITS.maxZipBytes && files <= GDN_LIMITS.maxFiles
    const warnings: string[] = []
    if (bytes.length > GDN_LIMITS.maxZipBytes) warnings.push(`ZIP ${kb(bytes.length)} — 150 KB sınırını aşıyor`)
    if (files > GDN_LIMITS.maxFiles) warnings.push(`${files} dosya — 40 dosya sınırını aşıyor`)
    last = { size, zip: bytes, bytes: bytes.length, files, level: lv, ok, warnings }
    if (ok) return last
  }
  return last!
}

export async function buildAll(
  c: Campaign,
  sizes: BannerSize[],
  onProgress?: (done: number, total: number) => void,
): Promise<{ results: SizeResult[]; bundle: Blob }> {
  const results: SizeResult[] = []
  for (const s of sizes) {
    results.push(await buildSizeZip(c, s))
    onProgress?.(results.length, sizes.length)
  }
  const outer = new JSZip()
  const base = slug(c.campaignName) || 'gdn-set'
  for (const r of results) outer.file(`${base}_${r.size.id}.zip`, r.zip)
  const bundle = await outer.generateAsync({ type: 'blob', compression: 'STORE' })
  return { results, bundle }
}

export const kb = (b: number) => `${(b / 1024).toFixed(1)} KB`

export function slug(s: string) {
  const map: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', Ç: 'C', Ğ: 'G', İ: 'I', Ö: 'O', Ş: 'S', Ü: 'U' }
  return s
    .replace(/[çğıöşüÇĞİÖŞÜ]/g, (ch) => map[ch])
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}
