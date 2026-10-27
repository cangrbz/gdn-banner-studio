import type { BannerSize, Campaign, Rect, SizeSettings } from '../types'

/**
 * Ürün alanının hesaplanması: laptop görsellerinin, fiyat etiketlerinin ve
 * özellik listelerinin konumları. Önizleme, export ve görsel küçültme aynı
 * hesabı kullanır.
 */

/** Laptop görsel kutusunun en/boy oranı (yükseklik / genişlik) */
export const LAPTOP_RATIO = 0.7

export interface ProductSlot {
  index: number
  img: Rect
  z: number
  /** row: (x, y) etiketin alt-orta noktası; col: sol-üst noktası */
  tag: { x: number; y: number; anchor: 'bottom-center' | 'top-left' } | null
  features: Rect | null
}

export function settingsFor(c: Campaign, size: BannerSize): SizeSettings {
  return { ...size.defaults, ...c.sizeSettings?.[size.id] }
}

/** Etiketin (rozet + fiyat kutusu) yaklaşık yüksekliği */
export const tagHeight = (f: { badge: number; price: number }) => f.badge * 1.45 + f.price * 1.4

export const featureLines = (c: Campaign) =>
  Math.max(0, ...c.products.map((p) => p.features.filter((f) => f.trim()).slice(0, 3).length))

export function layoutProducts(size: BannerSize, c: Campaign, s: SizeSettings): ProductSlot[] {
  const L = size.products
  const a = L.area
  const n = Math.min(3, c.products.length)
  if (!n) return []
  const tagH = s.showTags ? tagHeight(L.fonts) : 0
  const lines = s.showFeatures ? featureLines(c) : 0
  const featH = lines ? lines * L.fonts.feature * 1.3 + 4 : 0
  const gap = L.gap + s.gap

  if (L.arrange === 'col') {
    const slotH = (a.h - gap * (n - 1)) / n
    const tagRes = tagH * 0.55
    let w = L.laptopW
    let h = w * LAPTOP_RATIO
    const maxH = slotH - featH - tagRes
    if (h > maxH) {
      h = Math.max(10, maxH)
      w = h / LAPTOP_RATIO
    }
    return Array.from({ length: n }, (_, i) => {
      const top = a.y + i * (slotH + gap)
      const img = { x: a.x + (a.w - w) / 2 + L.shiftX, y: top + tagRes, w, h }
      return {
        index: i,
        img,
        z: 1,
        tag: s.showTags ? { x: img.x + L.tagX, y: top + s.tagOffset, anchor: 'top-left' as const } : null,
        features: lines ? { x: img.x, y: img.y + h + 3, w, h: featH } : null,
      }
    })
  }

  // row: ortadaki önde ve büyük, yanlar arkada
  const scales = n === 3 ? [L.sideScale, 1, L.sideScale] : Array(n).fill(1)
  const base = scales.map((k) => L.laptopW * k)
  const sum = base.reduce((t, w) => t + w, 0)
  const tagAbove = Math.max(0, tagH - L.tagDrop - s.tagOffset)
  const fitW = (a.w - gap * (n - 1)) / sum
  const fitH = (a.h - featH - tagAbove) / (L.laptopW * LAPTOP_RATIO)
  const f = Math.max(0.1, Math.min(1, fitW, fitH))
  const ws = base.map((w) => w * f)
  const total = sum * f + gap * (n - 1)
  // etiket + laptop + özellikler bloğu alanda dikey ortalanır
  const content = tagAbove + L.laptopW * f * LAPTOP_RATIO + featH
  const bottom = a.y + (a.h + content) / 2 - featH
  let x = a.x + (a.w - total) / 2
  const mid = (n - 1) / 2

  return ws.map((w, i) => {
    const h = w * LAPTOP_RATIO
    // arkadaki laptoplar biraz yukarıda durur (derinlik hissi)
    const lift = (1 - scales[i]) * h * 0.25
    const img = { x, y: bottom - h - lift, w, h }
    const overlap = Math.min(0, gap)
    const slot: ProductSlot = {
      index: i,
      img,
      z: 10 - Math.round(Math.abs(i - mid) * 2) + (n === 2 ? i : 0),
      tag: s.showTags
        ? { x: x + w / 2, y: img.y + L.tagDrop + s.tagOffset, anchor: 'bottom-center' }
        : null,
      features: lines ? { x: x - overlap / 2, y: bottom + 3, w: w + overlap, h: featH } : null,
    }
    x += w + gap
    return slot
  })
}
