import type { Campaign, Product } from '../types'

let counter = 0
export const uid = () => `p${Date.now().toString(36)}${(counter++).toString(36)}`

export const emptyProduct = (): Product => ({
  id: uid(),
  image: null,
  name: '',
  price: '',
  features: [],
})

/** Açılışta gösterilen örnek kampanya (gerçek veri değil) */
export const exampleCampaign = (): Campaign => ({
  campaignName: 'Örnek Laptop Kampanyası',
  clickUrl: 'https://www.example.com/laptop',
  headline: 'Heyecan veren\nperformans',
  subline: 'Oyun laptoplarını keşfet.',
  ctaText: 'Hemen keşfet',
  background: null,
  logo: null,
  colors: {
    bg: '#000000',
    bg2: '#0f4d12',
    text: '#ffffff',
    priceBg: '#39ff14',
    priceText: '#000000',
    badgeBg: '#8a2be2',
    badgeText: '#ffffff',
    ctaBg: '#000000',
    ctaText: '#ffffff',
  },
  products: [
    {
      id: uid(),
      image: null,
      name: 'Zenith G6 V3.5',
      price: '54.999 TL',
      features: ['RTX 5060', '165 Hz ekran', '16 GB RAM'],
    },
    {
      id: uid(),
      image: null,
      name: 'Zenith G6 V3.9',
      price: '69.999 TL',
      features: ['RTX 5070', '240 Hz ekran', '32 GB RAM'],
    },
    {
      id: uid(),
      image: null,
      name: 'Zenith S8 V1.2',
      price: '149.999 TL',
      features: ['RTX 5090', 'Mini LED ekran', '64 GB RAM'],
    },
  ],
  sizeSettings: {},
})

const KEY = 'gdn-banner-studio:v2'

export function loadCampaign(): Campaign | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const c = JSON.parse(raw) as Campaign
    // Eksik alanları örnekten tamamla (eski kayıtlar için)
    const ex = exampleCampaign()
    return { ...ex, ...c, colors: { ...ex.colors, ...c.colors }, sizeSettings: c.sizeSettings ?? {} }
  } catch {
    return null
  }
}

export function saveCampaign(c: Campaign) {
  try {
    localStorage.setItem(KEY, JSON.stringify(c))
  } catch {
    // Görseller kotayı aşarsa en azından metinleri sakla
    try {
      const lite: Campaign = {
        ...c,
        background: null,
        logo: null,
        products: c.products.map((p) => ({ ...p, image: null })),
      }
      localStorage.setItem(KEY, JSON.stringify(lite))
    } catch {
      /* depolama yok */
    }
  }
}
