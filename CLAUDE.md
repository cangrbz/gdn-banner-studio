# Laptop GDN Stüdyosu — Claude Code rehberi

Laptop kampanyaları için Google Display Network (GDN) HTML5 banner setlerini
üreten bir web uygulaması. Kullanıcı 1–3 laptop girer (görsel, model adı,
fiyat, 0–3 özellik) ve başlık/alt metin/buton yazar; uygulama 8 boyutun canlı önizlemesini gösterir ve her
boyut için GDN'e yüklenebilir ayrı bir ZIP üretir. Arayüz dili Türkçedir.

## Komutlar

- `npm install` — bağımlılıklar
- `npm run dev` — geliştirme sunucusu (http://localhost:5173)
- `npm run build` — tip kontrolü + üretim çıktısı (`dist/`)
- `npm run build:single` — tüm uygulama tek HTML dosyasında (`dist-single/index.html`), paylaşmak için

## Mimari

```
src/
  types.ts                 Kampanya verisi, boyut ayarları (SizeSettings), yerleşim tipleri
  banner/
    sizes.ts               8 boyutun yerleşim konfigürasyonu (piksel). Yerleşim değişiklikleri BURADA.
    logos.ts               Seçilebilir logolar (tam / ikon / yazı parçaları), SVG'ler src/assets/logos/
    layout.ts              Ürün alanı hesabı: laptop, fiyat etiketi ve özellik konumları
    timeline.ts            Giriş animasyonlarının gecikmeleri ve @keyframes'leri
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

### Banner kompozisyonu
Referans: elle yapılmış Tulpar GDN seti. Logo → başlık (büyük harf, kutuya sığacak
şekilde küçülür) → alt metin → laptoplar → çerçeveli buton.
- **row** dizilim (kare ve yatay boyutlar): laptoplar yan yana, ortadaki önde ve büyük,
  yanlar arkada ve üst üste biner. Fiyat etiketi laptopun üstünde ortalı.
- **col** dizilim (160×600, 300×1050): laptoplar alt alta, etiket sol üst köşeye biner.
- Fiyat etiketi = mor rozet (model adı) + yeşil fiyat kutusu; renkler editörden.
- Boyut başına ayarlar (`SizeSettings`, önizleme kartından): laptop aralığı ±,
  etiket dikey konumu ±, fiyat etiketi ve özellikler aç/kapa. Varsayılanlar `sizes.ts`'te `defaults`.
- Animasyon: öğeler sırayla girer, son karede kalır, buton 3 kez nabız atar (~6,6 sn).
  Tamamen CSS; banner içinde JS sadece `clickTag` tanımı.

### Önizleme = çıktı
Önizleme ve export aynı `renderBanner()` fonksiyonunu kullanır. Tek fark görsel
kaynaklarıdır (`resolve` fonksiyonu): önizlemede data URL, export'ta ZIP içindeki
dosya adı. Banner'da yapılan her değişiklik bu yüzden ikisine birden yansır.

## GDN kuralları (export bunlara göre kontrol eder)
- ZIP ≤ 150 KB, ≤ 40 dosya (`GDN_LIMITS`, buildZip.ts)
- `<meta name="ad.size" content="width=W,height=H">`
- `var clickTag = "..."` ve `window.open(window.clickTag)` ile tıklama
- Animasyon ≤ 30 sn
- Dış kaynak yok, tek istisna Google Fonts: banner fontu Saira Semi Condensed Bold
  `<link>` ile Google Fonts'tan gelir (ZIP'e font dosyası konamaz). Tüm görseller ZIP içinde

Kurallar değişebilir; Google Ads yardım sayfasından güncelliğini doğrula.

## Konvansiyonlar
- Yeni boyut eklemek: `sizes.ts`'e bir `BannerSize` ekle. Başka dosyaya dokunmak gerekmez.
- Logo serbest yükleme değil, listeden seçilir. Yeni logo: `src/assets/logos/` altına
  `<ad>.svg`, `<ad>-icon.svg`, `<ad>-word.svg` (ikon/yazı parçalarının viewBox'ı sadece o
  parçayı kapsar, tekrar eden şekiller temizlenmiş) koy ve `logos.ts`'e ekle.
  Boyutun `logoMode`'u: `full` (yatay), `icon` (dar boyutlar), `stacked` (dikey, ikon üstte yazı altta).
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
