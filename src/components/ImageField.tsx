import { useId, useRef } from 'react'
import { readFileAsDataUrl } from '../export/images'

interface Props {
  label: string
  hint?: string
  value: string | null
  onChange: (v: string | null) => void
  compact?: boolean
}

export function ImageField({ label, hint, value, onChange, compact }: Props) {
  const id = useId()
  const input = useRef<HTMLInputElement>(null)

  const pick = async (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return
    onChange(await readFileAsDataUrl(file))
  }

  return (
    <div
      className={`imgfield${compact ? ' compact' : ''}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        pick(e.dataTransfer.files[0])
      }}
    >
      <button type="button" className="imgfield-thumb" onClick={() => input.current?.click()} aria-label={`${label} seç`}>
        {value ? <img src={value} alt="" /> : <span className="imgfield-empty">+</span>}
      </button>
      <div className="imgfield-meta">
        <label htmlFor={id} className="field-label">{label}</label>
        {hint && <span className="field-hint">{hint}</span>}
        <div className="imgfield-actions">
          <button type="button" className="btn-link" onClick={() => input.current?.click()}>
            {value ? 'Değiştir' : 'Yükle'}
          </button>
          {value && (
            <button type="button" className="btn-link danger" onClick={() => onChange(null)}>
              Kaldır
            </button>
          )}
        </div>
      </div>
      <input
        id={id}
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        hidden
        onChange={(e) => {
          pick(e.target.files?.[0])
          e.target.value = ''
        }}
      />
    </div>
  )
}
