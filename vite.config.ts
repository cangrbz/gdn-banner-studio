import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `npm run build:single` tüm uygulamayı tek bir HTML dosyasına gömer
// (paylaşım / artifact önizleme için). Normal `npm run build` standart çıktı üretir.
export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === 'single' ? [viteSingleFile()] : [])],
}))
