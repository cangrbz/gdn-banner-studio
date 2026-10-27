/** Görsel yüklenmemiş ürünler için basit yer tutucu oyun laptopu çizimi (SVG). */
export function placeholderLaptopSvg(hue: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280">
<defs>
<linearGradient id="s" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#f4f6f8"/><stop offset="1" stop-color="#cfd5dc"/>
</linearGradient>
<linearGradient id="b" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#2a2d33"/><stop offset="1" stop-color="#0d0e10"/>
</linearGradient>
</defs>
<rect x="52" y="6" width="296" height="200" rx="8" fill="#16181c"/>
<rect x="62" y="16" width="276" height="174" rx="2" fill="url(#s)"/>
<rect x="88" y="62" width="150" height="20" rx="2" fill="#2a2d33"/>
<rect x="88" y="92" width="110" height="26" rx="2" fill="hsl(${hue},75%,42%)"/>
<rect x="76" y="160" width="34" height="20" fill="#1b1d21"/>
<path d="M14 208 H386 L372 246 Q368 256 354 256 H46 Q32 256 28 246Z" fill="url(#b)"/>
<path d="M70 216 H330 L322 236 H78Z" fill="hsl(${hue},90%,45%)" opacity=".55"/>
<rect x="170" y="240" width="60" height="8" rx="3" fill="#3a3e45"/>
</svg>`
}

export const svgToDataUrl = (svg: string) =>
  'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)

export const PLACEHOLDER_HUES = [110, 130, 95]
