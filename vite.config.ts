import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
import path from 'path'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    wasm(),
    topLevelAwait(),
    nodePolyfills({
      include: ['crypto', 'stream', 'buffer'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    })
  ],
  server: {
    port: 3000,
    host: true,
    cors: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'bn.js': path.resolve(__dirname, 'node_modules/bn.js/lib/bn.js'),
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      buffer: 'buffer'
    },
    dedupe: ['bn.js', '@futureverse/auth-react', '@futureverse/auth-ui', 'wagmi', 'viem']
  },
  optimizeDeps: {
    include: [
      '@polkadot/api',
      '@polkadot/util-crypto',
      '@polkadot/keyring',
      '@polkadot/extension-dapp',
      '@futureverse/auth-react',
      '@futureverse/auth-ui',
      'wagmi',
      'viem'
    ],
    esbuildOptions: {
      target: 'esnext'
    }
  },
  build: {
    target: 'esnext',
    sourcemap: true,
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks: {
          'polkadot': [
            '@polkadot/api',
            '@polkadot/util-crypto',
            '@polkadot/keyring',
            '@polkadot/extension-dapp'
          ],
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'web3-vendor': ['@reown/appkit', '@wagmi/core', 'viem', 'wagmi', '@futureverse/auth-react', '@futureverse/auth-ui'],
          'ui-vendor': ['framer-motion', '@heroicons/react']
        }
      }
    }
  },
  define: {
    global: 'globalThis',
  }
});