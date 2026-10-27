import UPNG from 'upng-js'

/** Görsel işleme: banner boyutuna göre küçültme + sıkıştırma (tamamen tarayıcıda). */

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image()
    img.onload = () => res(img)
    img.onerror = () => rej(new Error('Görsel yüklenemedi'))
    img.src = src
  })
}

export const isSvg = (dataUrl: string) => dataUrl.startsWith('data:image/svg')

function canvas(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.round(w))
  c.height = Math.max(1, Math.round(h))
  const ctx = c.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'
  return { c, ctx }
}

/**
 * Görseli kutuya sığacak şekilde (contain) küçültür ve renk paletine
 * indirgenmiş PNG olarak döndürür (şeffaflık korunur).
 * @param colors 0 = kayıpsız, 256/128/64 = kayıplı palet
 */
export function fitPng(img: HTMLImageElement, boxW: number, boxH: number, colors: number): Uint8Array {
  const ratio = Math.min(1, boxW / img.naturalWidth, boxH / img.naturalHeight)
  const w = Math.max(1, Math.round(img.naturalWidth * ratio))
  const h = Math.max(1, Math.round(img.naturalHeight * ratio))
  const { c, ctx } = canvas(w, h)
  ctx.drawImage(img, 0, 0, w, h)
  const data = ctx.getImageData(0, 0, c.width, c.height).data
  const buf = UPNG.encode([data.buffer as ArrayBuffer], c.width, c.height, colors)
  return new Uint8Array(buf)
}

/** Arka planı banner boyutuna kırparak (cover) JPEG'e çevirir. */
export async function coverJpeg(img: HTMLImageElement, w: number, h: number, quality: number): Promise<Uint8Array> {
  const { c, ctx } = canvas(w, h)
  const s = Math.max(c.width / img.naturalWidth, c.height / img.naturalHeight)
  const dw = img.naturalWidth * s
  const dh = img.naturalHeight * s
  ctx.drawImage(img, (c.width - dw) / 2, (c.height - dh) / 2, dw, dh)
  const blob: Blob = await new Promise((res) => c.toBlob((b) => res(b!), 'image/jpeg', quality))
  return new Uint8Array(await blob.arrayBuffer())
}

export function dataUrlToBytes(dataUrl: string): Uint8Array {
  const [head, body] = dataUrl.split(',')
  if (head.includes(';base64')) {
    const bin = atob(body)
    const out = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
    return out
  }
  return new TextEncoder().encode(decodeURIComponent(body))
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result as string)
    r.onerror = () => rej(r.error)
    r.readAsDataURL(file)
  })
}
