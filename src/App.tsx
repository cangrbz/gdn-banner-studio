import { useEffect, useMemo, useState } from 'react'
import type { Campaign, Product } from './types'
import { MAX_PRODUCTS } from './types'
import { SIZES } from './banner/sizes'
import { renderBanner } from './banner/renderBanner'
import { buildAll, buildSizeZip, kb, slug, type SizeResult } from './export/buildZip'
import { productSrc } from './export/buildZip'
import { emptyProduct, exampleCampaign, loadCampaign, saveCampaign } from './state/defaults'
import { saveFile } from './lib/download'
import { ImageField } from './components/ImageField'
import { ProductCard } from './components/ProductCard'
import { PreviewCard } from './components/PreviewCard'

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}

export default function App() {
  const [c, setC] = useState<Campaign>(() => loadCampaign() ?? exampleCampaign())
  const [replay, setReplay] = useState(0)
  const [results, setResults] = useState<Record<string, SizeResult>>({})
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<string>('')

  const debounced = useDebounced(c, 300)

  useEffect(() => saveCampaign(debounced), [debounced])
  // İçerik değişince eski ölçümler geçersiz
  useEffect(() => setResults({}), [debounced])

  const htmls = useMemo(() => {
    const out: Record<string, string> = {}
    for (const s of SIZES) {
      out[s.id] = renderBanner(debounced, s, (k) => {
        if (k === 'bg') return debounced.background
        if (k === 'logo') return debounced.logo
        return productSrc(debounced, Number(k.slice(1)))
      })
    }
    return out
  }, [debounced])

  const set = <K extends keyof Campaign>(k: K, v: Campaign[K]) => setC((prev) => ({ ...prev, [k]: v }))
  const setColor = (k: keyof Campaign['colors'], v: string) => setC((prev) => ({ ...prev, colors: { ...prev.colors, [k]: v } }))
  const setProducts = (fn: (ps: Product[]) => Product[]) => setC((prev) => ({ ...prev, products: fn(prev.products) }))

  const base = slug(c.campaignName) || 'gdn-set'

  async function exportAll() {
    setBusy(true)
    setStatus('Hazırlanıyor…')
    try {
      const { results: rs, bundle } = await buildAll(c, SIZES, (d, t) => setStatus(`Sıkıştırılıyor ${d}/${t}`))
      setResults(Object.fromEntries(rs.map((r) => [r.size.id, r])))
      const over = rs.filter((r) => !r.ok).length
      const res = await saveFile(`${base}_GDN-set.zip`, bundle)
      setStatus(
        res === 'declined'
          ? 'İndirme iptal edildi'
          : over
            ? `${rs.length} boyut indirildi, ${over} tanesi 150 KB sınırını aşıyor`
            : `${rs.length} boyut indirildi, hepsi GDN sınırları içinde`,
      )
    } catch (e) {
      setStatus(`Dışa aktarılamadı: ${(e as Error).message}`)
    } finally {
      setBusy(false)
    }
  }

  async function exportOne(id: string) {
    const size = SIZES.find((s) => s.id === id)!
    setBusy(true)
    try {
      const r = await buildSizeZip(c, size)
      setResults((prev) => ({ ...prev, [id]: r }))
      await saveFile(`${base}_${id}.zip`, new Blob([r.zip as BlobPart], { type: 'application/zip' }))
      setStatus(`${id} indirildi (${kb(r.bytes)})`)
    } catch (e) {
      setStatus(`Dışa aktarılamadı: ${(e as Error).message}`)
    } finally {
      setBusy(false)
    }
  }

  async function measure() {
    setBusy(true)
    const rs: Record<string, SizeResult> = {}
    for (const s of SIZES) {
      setStatus(`Ölçülüyor ${s.id}`)
      rs[s.id] = await buildSizeZip(c, s)
      setResults({ ...rs })
    }
    const over = Object.values(rs).filter((r) => !r.ok).length
    setStatus(over ? `${over} boyut 150 KB sınırını aşıyor` : 'Tüm boyutlar GDN sınırları içinde')
    setBusy(false)
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <div>
            <h1>Laptop GDN Stüdyosu</h1>
            <p className="brand-sub">HTML5 banner seti · {SIZES.length} boyut · {c.products.length} ürün</p>
          </div>
        </div>
        <div className="topbar-actions">
          {status && <span className="status" role="status">{status}</span>}
          <button type="button" className="btn-ghost" onClick={() => setReplay((r) => r + 1)}>Animasyonu tekrar oynat</button>
          <button type="button" className="btn-ghost" onClick={measure} disabled={busy}>Boyutları ölç</button>
          <button type="button" className="btn-primary" onClick={exportAll} disabled={busy}>
            {busy ? 'Çalışıyor…' : 'Tüm seti indir (.zip)'}
          </button>
        </div>
      </header>

      <div className="workspace">
        <aside className="panel">
          <section className="section">
            <h2 className="section-title">Kampanya</h2>
            <div className="field">
              <label className="field-label" htmlFor="campaignName">Kampanya adı</label>
              <input id="campaignName" value={c.campaignName} onChange={(e) => set('campaignName', e.target.value)} />
              <span className="field-hint">Dosya adlarında kullanılır: <code>{base}_300x250.zip</code></span>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="clickUrl">Tıklama adresi (clickTag)</label>
              <input id="clickUrl" type="url" value={c.clickUrl} onChange={(e) => set('clickUrl', e.target.value)} />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="ctaText">Buton metni</label>
              <input id="ctaText" value={c.ctaText} onChange={(e) => set('ctaText', e.target.value)} />
            </div>
          </section>

          <section className="section">
            <h2 className="section-title">Görünüm</h2>
            <ImageField label="Arka plan" hint="Her boyuta ortalanıp kırpılır" value={c.background} onChange={(v) => set('background', v)} />
            <ImageField label="Logo" hint="PNG veya SVG" value={c.logo} onChange={(v) => set('logo', v)} />
            <div className="swatches">
              {(
                [
                  ['bg', 'Zemin 1'],
                  ['bg2', 'Zemin 2'],
                  ['text', 'Metin'],
                  ['accent', 'Vurgu'],
                  ['ctaText', 'Buton yazısı'],
                ] as const
              ).map(([k, label]) => (
                <label className="swatch" key={k} htmlFor={`color-${k}`}>
                  <input id={`color-${k}`} type="color" value={c.colors[k]} onChange={(e) => setColor(k, e.target.value)} />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            <p className="field-hint">Zemin renkleri sadece arka plan görseli yokken kullanılır.</p>
          </section>

          <section className="section">
            <div className="section-row">
              <h2 className="section-title">Ürünler</h2>
              <span className="pill num">{c.products.length} / {MAX_PRODUCTS}</span>
            </div>
            {c.products.map((p, i) => (
              <ProductCard
                key={p.id}
                index={i}
                product={p}
                canRemove={c.products.length > 1}
                canMoveUp={i > 0}
                canMoveDown={i < c.products.length - 1}
                onChange={(np) => setProducts((ps) => ps.map((x) => (x.id === p.id ? np : x)))}
                onRemove={() => setProducts((ps) => ps.filter((x) => x.id !== p.id))}
                onMove={(dir) =>
                  setProducts((ps) => {
                    const a = [...ps]
                    const j = i + dir
                    ;[a[i], a[j]] = [a[j], a[i]]
                    return a
                  })
                }
              />
            ))}
            {c.products.length < MAX_PRODUCTS && (
              <button type="button" className="btn-ghost add" onClick={() => setProducts((ps) => [...ps, emptyProduct()])}>
                + Laptop ekle
              </button>
            )}
          </section>

          <section className="section reset">
            <button
              type="button"
              className="btn-link danger"
              onClick={() => {
                setC(exampleCampaign())
                setStatus('Örnek veriye dönüldü')
              }}
            >
              Örnek veriye sıfırla
            </button>
          </section>
        </aside>

        <main className="stage">
          <div className="stage-note">
            {c.products.length === 1
              ? 'Tek ürün: banner bir kez oynar ve son karede durur.'
              : `${c.products.length} ürün sırayla gösterilir, ardından hepsi bir arada kapanış karesi gelir. Döngü 30 saniyeyi geçmez.`}
          </div>
          <div className="previews">
            {SIZES.map((s) => (
              <PreviewCard
                key={s.id}
                size={s}
                html={htmls[s.id]}
                replayKey={replay}
                result={results[s.id]}
                busy={busy}
                onDownload={() => exportOne(s.id)}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
