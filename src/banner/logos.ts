import tulparFull from '../assets/logos/tulpar.svg?raw'
import tulparIcon from '../assets/logos/tulpar-icon.svg?raw'
import tulparWord from '../assets/logos/tulpar-word.svg?raw'
import monsterFull from '../assets/logos/monster.svg?raw'
import monsterIcon from '../assets/logos/monster-icon.svg?raw'
import monsterWord from '../assets/logos/monster-word.svg?raw'

/**
 * Banner'da seçilebilecek logolar.
 *
 * Her logo üç parçadan oluşur: tam (yatay ikon + yazı), sadece ikon ve sadece
 * yazı. Boyutun `logoMode` değeri hangisinin kullanılacağını belirler; dikey
 * boyutlarda ikon ve yazı üst üste dizilir.
 *
 * Yeni logo eklemek: SVG'leri src/assets/logos/ altına koy (ikon ve yazı
 * parçalarının viewBox'ı sadece o parçayı kapsayacak şekilde) ve buraya ekle.
 */
export interface LogoDef {
  id: string
  label: string
  full: string
  icon: string
  word: string
}

export const LOGOS: LogoDef[] = [
  { id: 'tulpar', label: 'Tulpar', full: tulparFull, icon: tulparIcon, word: tulparWord },
  { id: 'monster', label: 'Monster', full: monsterFull, icon: monsterIcon, word: monsterWord },
]

export const getLogo = (id: string | null | undefined) => LOGOS.find((l) => l.id === id) ?? null

/** SVG'nin viewBox'ından en/boy oranı (genişlik / yükseklik) */
export function svgAspect(svg: string): number {
  const m = svg.match(/viewBox="([^"]+)"/)
  const [, , w, h] = (m?.[1] ?? '0 0 1 1').split(/[\s,]+/).map(Number)
  return w && h ? w / h : 1
}
