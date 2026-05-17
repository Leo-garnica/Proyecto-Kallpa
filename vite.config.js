import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      // Usar Babel (compatible con vite 5 + @vitejs/plugin-react 4.x)
      babel: {
        plugins: [],
      },
    }),
  ],
})
