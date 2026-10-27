import type { BannerSize } from '../types'
import type { SizeResult } from '../export/buildZip'
import { GDN_LIMITS, kb } from '../export/buildZip'

interface Props {
  size: BannerSize
  html: string
  replayKey: number
  result?: SizeResult
  onDownload: () => void
  busy: boolean
}

const MAX_W = 470
const MAX_H = 600

export function PreviewCard({ size, html, replayKey, result, onDownload, busy }: Props) {
  const scale = Math.min(1, MAX_W / size.width, MAX_H / size.height)
  const w = Math.round(size.width * scale)
  const h = Math.round(size.height * scale)
  const pct = result ? Math.min(100, (result.bytes / GDN_LIMITS.maxZipBytes) * 100) : 0

  return (
    <figure className="preview" style={{ width: Math.max(w, 230) }}>
      <figcaption className="preview-head">
        <span className="preview-size num">
          {size.width}<span className="x">×</span>{size.height}
        </span>
        <span className="preview-label">{size.label}</span>
        {scale < 1 && <span className="preview-scale num">%{Math.round(scale * 100)}</span>}
      </figcaption>

      <div className="preview-frame" style={{ width: w, height: h }}>
        <iframe
          key={replayKey}
          title={`${size.id} önizleme`}
          srcDoc={html}
          sandbox="allow-scripts"
          width={size.width}
          height={size.height}
          style={{ transform: `scale(${scale})` }}
        />
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
