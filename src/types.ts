// ---- Kampanya verisi (editörde doldurulan) ----

export interface Product {
  id: string
  /** data URL (yüklenen görsel) — boşsa yer tutucu laptop çizilir */
  image: string | null
  /** Fiyatın üstündeki rozette görünen model adı (ör. "ZENITH G6 V3.5") */
  name: string
  price: string
  /** 0–3 özellik; banner'da gösterilip gösterilmeyeceği boyut başına ayarlanır */
  features: string[]
}

export interface Colors {
  /** zemin (arka plan görseli yokken) */
  bg: string
  /** zemindeki ışık / parlama */
  bg2: string
  /** başlık ve alt metin */
  text: string
  priceBg: string
  priceText: string
  badgeBg: string
  badgeText: string
  ctaBg: string
  /** buton yazısı ve çerçevesi */
  ctaText: string
}

/** Boyut başına kullanıcı ayarları (önizleme kartından değiştirilir) */
export interface SizeSettings {
  /** laptoplar arası boşluğa eklenen değer (px); negatif → daha çok üst üste biner */
  gap: number
  /** fiyat etiketinin dikey kayması (px); pozitif → laptopun üzerine iner */
  tagOffset: number
  showTags: boolean
  showFeatures: boolean
}

export interface Campaign {
  campaignName: string
  clickUrl: string
  /** Satır sonu için Enter (\n) */
  headline: string
  subline: string
  ctaText: string
  /** Arka plan görseli (data URL). Boşsa renklerden degrade kullanılır. */
  background: string | null
  logo: string | null
  colors: Colors
  products: Product[]
  /** boyut id → ayar; olmayan alanlar boyutun varsayılanından gelir */
  sizeSettings: Record<string, Partial<SizeSettings>>
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

export interface TextBox extends Rect {
  /** en büyük yazı boyutu; metin sığmazsa küçültülür */
  font: number
  align: 'left' | 'center'
}

export interface ProductsLayout {
  /** laptopların (etiketler ve özellikler dahil) yerleşeceği alan */
  area: Rect
  /** 'row' yan yana (ortadaki önde ve büyük), 'col' alt alta */
  arrange: 'row' | 'col'
  /** öndeki laptop görselinin genişliği */
  laptopW: number
  /** row: yandaki laptopların ölçeği */
  sideScale: number
  /** varsayılan boşluk; negatif → üst üste biner */
  gap: number
  /** col: laptopun alan ortasından yatay kayması */
  shiftX: number
  /** col: etiketin laptop sol kenarına göre yatay konumu (negatif → dışarı taşar) */
  tagX: number
  /** row: etiketin laptop üst kenarından ne kadar aşağı ineceği */
  tagDrop: number
  fonts: { badge: number; price: number; feature: number }
}

export interface BannerSize {
  id: string // "300x250"
  width: number
  height: number
  label: string
  logo: Rect
  headline: TextBox & { oneLine?: boolean }
  /** null → bu boyutta alt metin yok */
  sub: TextBox | null
  products: ProductsLayout
  cta: Rect & { font: number }
  defaults: SizeSettings
}
