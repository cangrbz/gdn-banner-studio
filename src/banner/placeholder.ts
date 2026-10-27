/** Görsel yüklenmemiş ürünler için basit yer tutucu laptop çizimi (SVG). */
export function placeholderLaptopSvg(hue: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260">
<defs>
<linearGradient id="s" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="hsl(${hue},70%,62%)"/><stop offset="1" stop-color="hsl(${(hue + 50) % 360},70%,38%)"/>
</linearGradient>
<linearGradient id="b" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#d9dde3"/><stop offset="1" stop-color="#9aa1ab"/>
</linearGradient>
</defs>
<rect x="62" y="8" width="276" height="196" rx="10" fill="#22262d"/>
<rect x="72" y="18" width="256" height="170" rx="3" fill="url(#s)"/>
<path d="M72 150 L160 90 L230 140 L328 70 L328 188 L72 188Z" fill="rgba(255,255,255,.12)"/>
<path d="M18 206 H382 L366 236 Q362 244 350 244 H50 Q38 244 34 236Z" fill="url(#b)"/>
<rect x="170" y="206" width="60" height="7" rx="3" fill="#7d848e"/>
</svg>`
}

export const svgToDataUrl = (svg: string) =>
  'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)

export const PLACEHOLDER_HUES = [210, 280, 20]
