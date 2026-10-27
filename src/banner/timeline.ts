/**
 * Animasyon zaman çizelgesi.
 *
 * Banner'daki tüm hareketli öğeler aynı toplam süreyi (loop süresi) ve aynı
 * tekrar sayısını paylaşır; her öğe için o loop içindeki görünme/kaybolma
 * anları yüzde olarak hesaplanıp ayrı bir @keyframes üretilir. Böylece JS
 * gerekmeden saf CSS ile, GDN'in 30 sn kuralına uyan bir döngü elde edilir.
 */

export const TIMING = {
  /** tek ürünlü banner'ın süresi (tek seferlik oynar, son karede durur) */
  single: 4.5,
  /** çok ürünlü akışta her ürün karesinin süresi */
  productFrame: 3.2,
  /** kapanış (tüm ürünler) karesinin süresi */
  endFrame: 3.8,
  /** giriş animasyonu süresi */
  inDur: 0.5,
  /** çıkış animasyonu süresi */
  outDur: 0.3,
  /** GDN: animasyon en fazla 30 sn */
  maxTotal: 30,
  maxLoops: 3,
}

export type Motion = 'fade' | 'left' | 'right' | 'up' | 'zoom'

export interface Segment {
  /** loop başından itibaren saniye */
  start: number
  end: number
  /** son kare mi (loop sonunda görünür kalır) */
  holdToEnd: boolean
}

export interface Plan {
  loopDuration: number
  loops: number
  frames: Segment[]
  endFrame: Segment | null
}

export function makePlan(productCount: number, hasEndFrame: boolean): Plan {
  if (productCount <= 1) {
    const d = TIMING.single
    return {
      loopDuration: d,
      loops: 1,
      frames: [{ start: 0, end: d, holdToEnd: true }],
      endFrame: null,
    }
  }
  const frames: Segment[] = []
  let t = 0
  for (let i = 0; i < productCount; i++) {
    const isLast = i === productCount - 1 && !hasEndFrame
    frames.push({ start: t, end: t + TIMING.productFrame, holdToEnd: isLast })
    t += TIMING.productFrame
  }
  let endFrame: Segment | null = null
  if (hasEndFrame) {
    endFrame = { start: t, end: t + TIMING.endFrame, holdToEnd: true }
    t += TIMING.endFrame
  }
  const loops = Math.max(1, Math.min(TIMING.maxLoops, Math.floor(TIMING.maxTotal / t)))
  return { loopDuration: t, loops, frames, endFrame }
}

const FROM: Record<Motion, string> = {
  fade: 'opacity:0',
  left: 'opacity:0;transform:translateX(-24px)',
  right: 'opacity:0;transform:translateX(32px)',
  up: 'opacity:0;transform:translateY(14px)',
  zoom: 'opacity:0;transform:scale(.85)',
}
const VISIBLE = 'opacity:1;transform:none'
const OUT = 'opacity:0;transform:none'

const pct = (sec: number, total: number) =>
  `${Math.min(100, Math.max(0, (sec / total) * 100)).toFixed(3)}%`

/**
 * Bir öğe için @keyframes üretir.
 * @param delay kare başlangıcından itibaren gecikme (sn)
 */
export function keyframes(
  name: string,
  seg: Segment,
  delay: number,
  motion: Motion,
  total: number,
): string {
  const inStart = seg.start + delay
  const inEnd = inStart + TIMING.inDur
  const steps: string[] = []
  steps.push(`0%{${FROM[motion]}}`)
  if (inStart > 0) steps.push(`${pct(inStart, total)}{${FROM[motion]}}`)
  steps.push(`${pct(inEnd, total)}{${VISIBLE}}`)
  if (seg.holdToEnd) {
    steps.push(`100%{${VISIBLE}}`)
  } else {
    steps.push(`${pct(seg.end - TIMING.outDur, total)}{${VISIBLE}}`)
    steps.push(`${pct(seg.end, total)}{${OUT}}`)
    steps.push(`100%{${OUT}}`)
  }
  return `@keyframes ${name}{${steps.join('')}}`
}
