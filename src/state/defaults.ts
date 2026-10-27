import type { Campaign, Product } from '../types'

let counter = 0
export const uid = () => `p${Date.now().toString(36)}${(counter++).toString(36)}`

export const emptyProduct = (): Product => ({
  id: uid(),
  image: null,
  name: '',
  model: '',
  price: '',
  features: [],
})

/** Açılışta gösterilen örnek kampanya (gerçek veri değil) */
export const exampleCampaign = (): Campaign => ({
  campaignName: 'Örnek Laptop Kampanyası',
  clickUrl: 'https://www.example.com/laptop',
  ctaText: 'Hemen İncele',
  background: null,
  logo: null,
  colors: {
    bg: '#0f1d3a',
    bg2: '#1f3f7a',
    text: '#ffffff',
    accent: '#ffb020',
    ctaText: '#14213d',
  },
  products: [
    {
      id: uid(),
      image: null,
      name: 'Zenith Book 14',
      model: 'Core Ultra 7 · 16 GB · 1 TB SSD',
      price: '42.999 TL',
      features: ['2.8K OLED ekran', '18 saate kadar pil', '1,2 kg'],
    },
    {
      id: uid(),
      image: null,
      name: 'Nova Pro 16',
      model: 'Ryzen 9 · 32 GB · RTX 4070',
      price: '64.499 TL',
      features: ['165 Hz ekran', 'Gelişmiş soğutma'],
    },
    {
      id: uid(),
      image: null,
      name: 'Aero 13',
      model: 'Core i5 · 8 GB · 512 GB SSD',
      price: '24.999 TL',
      features: [],
    },
  ],
})

const KEY = 'gdn-banner-studio:v1'

export function loadCampaign(): Campaign | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Campaign) : null
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
