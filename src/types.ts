// ---- Kampanya verisi (editörde doldurulan) ----

export interface Product {
  id: string
  /** data URL (yüklenen görsel) — boşsa yer tutucu laptop çizilir */
  image: string | null
  name: string
  model: string
  price: string
  /** 0–3 özellik */
  features: string[]
}

export interface Campaign {
  campaignName: string
  clickUrl: string
  ctaText: string
  /** Arka plan görseli (data URL). Boşsa bgColor gradient kullanılır. */
  background: string | null
  logo: string | null
  colors: {
    bg: string
    bg2: string
    text: string
    accent: string
    ctaText: string
  }
  products: Product[]
}

export const MAX_PRODUCTS = 3
export const MAX_FEATURES = 3

// ---- Yerleşim (layout) tanımları ----

/** Banner içinde piksel cinsinden kutu */
export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export interface FontSizes {
  name: number
  model: number
  price: number
  feature: number
  cta: number
}

/** Tek ürünün tam ekran gösterildiği kare (frame) */
export interface ProductFrameLayout {
  logo: Rect
  image: Rect
  info: Rect
  price: Rect
  features: Rect
  cta: Rect
  /** özellik listesi: 'list' alt alta, 'inline' yan yana */
  featureStyle?: 'list' | 'inline'
  /** metin hizası */
  align?: 'left' | 'center'
}

/** 2–3 ürünün birlikte gösterildiği kapanış karesi */
export interface EndFrameLayout {
  /** ürün hücrelerinin yerleşeceği alan */
  area: Rect
  /** hücreler yan yana mı alt alta mı */
  direction: 'row' | 'col'
  /** hücre içi: görsel üstte (stack) ya da solda (side) */
  cell: 'stack' | 'side'
  gap: number
  cta: Rect
  logo: Rect
  fonts: { name: number; price: number }
}

export interface BannerSize {
  id: string // "300x250"
  width: number
  height: number
  label: string
  fonts: FontSizes
  frame: ProductFrameLayout
  /** ürün sayısına göre kapanış karesi; null → kapanış karesi yok */
  endFrame: { 2: EndFrameLayout | null; 3: EndFrameLayout | null }
}
