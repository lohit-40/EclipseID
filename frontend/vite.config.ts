import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(), 
    // @ts-ignore
    wasm(), 
    // @ts-ignore
    topLevelAwait(),
    nodePolyfills()
  ],
  build: { target: 'esnext' },
  optimizeDeps: {
    exclude: [
      '@midnight-ntwrk/ledger-v8',
      '@midnight-ntwrk/ledger-v8-crypto',
      '@midnight-ntwrk/zkir-witness-api'
    ]
  }
})
