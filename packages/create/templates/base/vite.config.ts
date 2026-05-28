import { defineConfig } from 'vite'
import { goqoo } from '@goqoo/vite-plugin'

export default defineConfig({
  plugins: [goqoo({ appsDir: 'src/apps' })],
})
