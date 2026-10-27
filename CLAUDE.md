# Laptop GDN Stüdyosu — Claude Code rehberi

Laptop kampanyaları için Google Display Network (GDN) HTML5 banner setlerini
üreten bir web uygulaması. Kullanıcı 1–3 laptop girer (görsel, ad, model,
fiyat, 0–3 özellik); uygulama 8 boyutun canlı önizlemesini gösterir ve her
boyut için GDN'e yüklenebilir ayrı bir ZIP üretir. Arayüz dili Türkçedir.

## Komutlar

- `npm install` — bağımlılıklar
- `npm run dev` — geliştirme sunucusu (http://localhost:5173)
- `npm run build` — tip kontrolü + üretim çıktısı (`dist/`)
- `npm run build:single` — tüm uygulama tek HTML dosyasında (`dist-single/index.html`), paylaşmak için

## Mimari

```
src/
  types.ts                 Kampanya verisi + yerleşim tipleri (Rect, ProductFrameLayout, EndFrameLayout)
  banner/
    sizes.ts               8 boyutun yerleşim konfigürasyonu (piksel). Yerleşim değişiklikleri BURADA.
    timeline.ts            Animasyon zaman çizelgesi; her öğe için @keyframes üretir, 30 sn kuralı
    renderBanner.ts        Kampanya + boyut → bağımsız GDN HTML (ad.size meta, clickTag)
    placeholder.ts         Görsel yokken çizilen yer tutucu laptop SVG
  export/
    images.ts              Canvas ile küçültme, UPNG ile palet PNG, arka plan JPEG
    buildZip.ts            Boyut başına ZIP; 150 KB'ı aşarsa daha agresif kademeyle tekrar dener
  components/              ImageField, ProductCard, PreviewCard
  state/defaults.ts        Örnek kampanya, localStorage kaydı
  lib/download.ts          İndirme (claude.ai artifact içinde `downloads` yeteneği, aksi halde <a download>)
  App.tsx                  Editör (sol form, sağ önizleme ızgarası)
```

### Banner akışı
- **1 ürün:** tek kare, bir kez oynar ve son karede durur.
- **2–3 ürün:** her ürün sırayla kendi karesinde (3,2 sn), sonra hepsinin bir arada
  olduğu kapanış karesi (3,8 sn). Toplam döngü ≤ 30 sn olacak kadar tekrar eder (en fazla 3).
- Animasyon tamamen CSS; banner içinde JS sadece `clickTag` tanımı.

### Önizleme = çıktı
Önizleme ve export aynı `renderBanner()` fonksiyonunu kullanır. Tek fark görsel
kaynaklarıdır (`resolve` fonksiyonu): önizlemede data URL, export'ta ZIP içindeki
dosya adı. Banner'da yapılan her değişiklik bu yüzden ikisine birden yansır.

## GDN kuralları (export bunlara göre kontrol eder)
- ZIP ≤ 150 KB, ≤ 40 dosya (`GDN_LIMITS`, buildZip.ts)
- `<meta name="ad.size" content="width=W,height=H">`
- `var clickTag = "..."` ve `window.open(window.clickTag)` ile tıklama
- Animasyon ≤ 30 sn
- Dış kaynak yok: font sistem fontu (Arial), tüm görseller ZIP içinde

Kurallar değişebilir; Google Ads yardım sayfasından güncelliğini doğrula.

## Konvansiyonlar
- Yeni boyut eklemek: `sizes.ts`'e bir `BannerSize` ekle. Başka dosyaya dokunmak gerekmez.
- Yerleşim değerleri piksel; koordinatlar banner'ın sol üst köşesinden.
- Kullanıcıya görünen tüm metinler Türkçe.
- Banner HTML'ine harici kütüphane ekleme (dosya boyutu ve GDN uyumluluğu).

## Yol haritası (sıradaki iterasyonlar için fikirler)
- Gerçek tasarım şablonu: kurumsal background, logo ve font ile yerleşimleri birebir uydurma
- Boyut başına farklı arka plan görseli
- Statik yedek görsel (backup PNG/JPG) üretimi
- Fiyat için "eski fiyat / indirim" alanı, rozet (ör. "Yeni", "%15 indirim")
- Animasyon ön ayarları (kayma, zoom, fade) ve süre ayarı
- Proje kaydet/aç (JSON), birden fazla kampanya
- İsteğe bağlı: Electron/Tauri ile masaüstü paketleme
