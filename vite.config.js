import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // 글꼴 등을 CSS 안에 넣지 않고 파일로 둬서 보안 정책(CSP)과 충돌하지 않게 해요
  build: { assetsInlineLimit: 0 },
})
