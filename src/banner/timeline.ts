/**
 * Animasyon zaman çizelgesi.
 *
 * Banner tek kompozisyondur: öğeler sırayla (logo → başlık → laptoplar →
 * fiyat etiketleri → buton) girer ve son karede kalır. Ardından buton birkaç
 * kez hafifçe nabız atar. Tamamı saf CSS; toplam süre GDN'in 30 sn
 * kuralının çok altındadır.
 */

export const TIMING = {
  /** giriş animasyonu süresi */
  inDur: 0.55,
  logo: 0,
  headline: 0.15,
  sub: 0.3,
  /** ilk laptop; sonrakiler laptopStep arayla */
  laptop: 0.45,
  laptopStep: 0.15,
  /** ilk etiket; sonrakiler tagStep arayla */
  tag: 0.95,
  tagStep: 0.12,
  features: 1.35,
  cta: 1.4,
  /** buton nabzı: başlangıç, tek tur süresi, tekrar */
  pulseStart: 2.4,
  pulseDur: 1.4,
  pulseCount: 3,
  /** GDN: animasyon en fazla 30 sn */
  maxTotal: 30,
}

export type Motion = 'fade' | 'up' | 'down' | 'zoom' | 'pop'

export const KEYFRAMES: Record<Motion | 'pulse', string> = {
  fade: '@keyframes fade{from{opacity:0}to{opacity:1}}',
  up: '@keyframes up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}',
  down: '@keyframes down{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:none}}',
  zoom: '@keyframes zoom{from{opacity:0;transform:scale(.86) translateY(10px)}to{opacity:1;transform:none}}',
  pop: '@keyframes pop{0%{opacity:0;transform:scale(.6)}70%{opacity:1;transform:scale(1.06)}100%{opacity:1;transform:none}}',
  pulse: '@keyframes pulse{0%,100%{transform:none}50%{transform:scale(1.05)}}',
}

/** Bir öğenin giriş animasyonu (inline style) */
export const enter = (motion: Motion, delay: number) =>
  `animation:${motion} ${TIMING.inDur}s cubic-bezier(.2,.7,.2,1) ${delay.toFixed(2)}s both;`

/** Toplam animasyon süresi (sn) — GDN kontrolü için */
export const totalDuration = () =>
  TIMING.pulseStart + TIMING.pulseDur * TIMING.pulseCount
