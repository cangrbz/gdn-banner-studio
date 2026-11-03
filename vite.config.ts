import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `npm run build:single` tüm uygulamayı tek bir HTML dosyasına gömer
// (paylaşım / artifact önizleme için). Normal `npm run build` standart çıktı üretir.
//
// GitHub Pages uygulamayı https://cangrbz.github.io/gdn-banner-studio/ altında
// yayınlar; normal derlemede dosya yolları bu alt klasöre göre yazılır.
// Geliştirme sunucusu kök (/) yolunda çalışmaya devam eder.
export default defineConfig(({ command, mode, isPreview }) => ({
  base: (command === 'build' || isPreview) && mode !== 'single' ? '/gdn-banner-studio/' : '/',
  plugins: [react(), ...(mode === 'single' ? [viteSingleFile()] : [])],
}))
