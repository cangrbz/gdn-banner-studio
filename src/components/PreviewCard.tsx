import type { CSSProperties } from 'react'
import type { BannerSize, SizeSettings } from '../types'
import type { SizeResult } from '../export/buildZip'
import { GDN_LIMITS, kb } from '../export/buildZip'

interface Props {
  size: BannerSize
  html: string
  replayKey: number
  result?: SizeResult
  onDownload: () => void
  busy: boolean
  settings: SizeSettings
  onSettings: (patch: Partial<SizeSettings>) => void
  onResetSettings: () => void
}

const MAX_W = 470
const MAX_H = 600
const STEP = 2

function Stepper({ label, value, onChange, hint }: { label: string; value: number; onChange: (v: number) => void; hint: string }) {
  return (
    <div className="stepper" title={hint}>
      <span className="stepper-label">{label}</span>
      <button type="button" className="icon-btn" aria-label={`${label} azalt`} onClick={() => onChange(value - STEP)}>−</button>
      <span className="stepper-value num">{value > 0 ? `+${value}` : value}</span>
      <button type="button" className="icon-btn" aria-label={`${label} artır`} onClick={() => onChange(value + STEP)}>+</button>
    </div>
  )
}

export function PreviewCard({ size, html, replayKey, result, onDownload, busy, settings, onSettings, onResetSettings }: Props) {
  const scale = Math.min(1, MAX_W / size.width, MAX_H / size.height)
  const w = Math.round(size.width * scale)
  const h = Math.round(size.height * scale)
  const pct = result ? Math.min(100, (result.bytes / GDN_LIMITS.maxZipBytes) * 100) : 0
  const d = size.defaults
  const changed =
    settings.gap !== d.gap ||
    settings.tagOffset !== d.tagOffset ||
    settings.showTags !== d.showTags ||
    settings.showFeatures !== d.showFeatures

  return (
    <figure className="preview" style={{ width: Math.max(w, 260) }}>
      <figcaption className="preview-head">
        <span className="preview-size num">
          {size.width}<span className="x">×</span>{size.height}
        </span>
        <span className="preview-label">{size.label}</span>
        {scale < 1 && <span className="preview-scale num">%{Math.round(scale * 100)}</span>}
      </figcaption>

      {/* Ölçüler width/height özelliği ya da düz style yerine CSS değişkeniyle verilir:
          reklam engelleyiciler 160×600, 728×90 gibi standart reklam ölçülerindeki
          iframe'leri bu özelliklerden tanıyıp gizliyor. */}
      <div
        className="preview-frame"
        style={{ '--fw': `${w}px`, '--fh': `${h}px`, '--bw': `${size.width}px`, '--bh': `${size.height}px`, '--s': scale } as CSSProperties}
      >
        <iframe key={replayKey} title="Banner önizleme" srcDoc={html} sandbox="allow-scripts" />
      </div>

      <div className="preview-settings">
        <Stepper
          label="Aralık"
          value={settings.gap}
          onChange={(v) => onSettings({ gap: v })}
          hint="Laptoplar arasındaki boşluk (px). Eksi değer laptopları üst üste bindirir."
        />
        <Stepper
          label="Etiket"
          value={settings.tagOffset}
          onChange={(v) => onSettings({ tagOffset: v })}
          hint="Fiyat etiketinin dikey konumu (px). Artı değer etiketi laptopun üzerine indirir."
        />
        <label className="check">
          <input type="checkbox" checked={settings.showTags} onChange={(e) => onSettings({ showTags: e.target.checked })} />
          Fiyat etiketi
        </label>
        <label className="check">
          <input type="checkbox" checked={settings.showFeatures} onChange={(e) => onSettings({ showFeatures: e.target.checked })} />
          Özellikler
        </label>
        {changed && (
          <button type="button" className="btn-link" onClick={onResetSettings}>Sıfırla</button>
        )}
      </div>

      <div className="preview-foot">
        {result ? (
          <div className={`budget ${result.ok ? 'ok' : 'over'}`} title={result.warnings.join('\n') || 'GDN sınırları içinde'}>
            <div className="budget-bar"><span style={{ width: `${pct}%` }} /></div>
            <span className="budget-text num">
              {kb(result.bytes)} / 150 KB · {result.files} dosya
            </span>
          </div>
        ) : (
          <span className="budget-text muted">Boyut henüz ölçülmedi</span>
        )}
        <button type="button" className="btn-link" onClick={onDownload} disabled={busy}>
          ZIP indir
        </button>
      </div>
    </figure>
  )
}
