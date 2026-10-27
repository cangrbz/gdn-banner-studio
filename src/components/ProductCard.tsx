import type { Product } from '../types'
import { MAX_FEATURES } from '../types'
import { ImageField } from './ImageField'

interface Props {
  index: number
  product: Product
  canRemove: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  onChange: (p: Product) => void
  onRemove: () => void
  onMove: (dir: -1 | 1) => void
}

export function ProductCard({ index, product: p, canRemove, canMoveUp, canMoveDown, onChange, onRemove, onMove }: Props) {
  const set = <K extends keyof Product>(k: K, v: Product[K]) => onChange({ ...p, [k]: v })
  const fid = (k: string) => `${p.id}-${k}`

  return (
    <article className="product">
      <header className="product-head">
        <span className="product-index">Laptop {index + 1}</span>
        <div className="product-tools">
          <button type="button" className="icon-btn" disabled={!canMoveUp} onClick={() => onMove(-1)} aria-label="Yukarı taşı">↑</button>
          <button type="button" className="icon-btn" disabled={!canMoveDown} onClick={() => onMove(1)} aria-label="Aşağı taşı">↓</button>
          {canRemove && (
            <button type="button" className="icon-btn danger" onClick={onRemove} aria-label="Laptopu kaldır">✕</button>
          )}
        </div>
      </header>

      <ImageField
        label="Ürün görseli"
        hint="Şeffaf PNG önerilir"
        value={p.image}
        onChange={(v) => set('image', v)}
        compact
      />

      <div className="grid2">
        <div className="field">
          <label className="field-label" htmlFor={fid('name')}>Model adı (rozet)</label>
          <input id={fid('name')} value={p.name} onChange={(e) => set('name', e.target.value)} placeholder="ör. Zenith G6 V3.5" />
        </div>
        <div className="field">
          <label className="field-label" htmlFor={fid('price')}>Fiyat</label>
          <input id={fid('price')} value={p.price} onChange={(e) => set('price', e.target.value)} placeholder="54.999 TL" className="num" />
        </div>
      </div>

      <div className="field">
        <span className="field-label">
          Özellikler <span className="field-count">{p.features.length}/{MAX_FEATURES}</span>
        </span>
        <div className="features">
          {p.features.map((f, k) => (
            <div className="feature-row" key={k}>
              <input
                id={fid(`f${k}`)}
                aria-label={`Özellik ${k + 1}`}
                value={f}
                onChange={(e) => set('features', p.features.map((x, j) => (j === k ? e.target.value : x)))}
                placeholder="ör. 165 Hz ekran"
              />
              <button
                type="button"
                className="icon-btn"
                aria-label={`Özellik ${k + 1} sil`}
                onClick={() => set('features', p.features.filter((_, j) => j !== k))}
              >
                −
              </button>
            </div>
          ))}
          {p.features.length < MAX_FEATURES && (
            <button type="button" className="btn-ghost small" onClick={() => set('features', [...p.features, ''])}>
              + Özellik ekle
            </button>
          )}
        </div>
        <span className="field-hint">Hangi boyutlarda gösterileceğini önizleme kartlarından seçersin.</span>
      </div>
    </article>
  )
}
