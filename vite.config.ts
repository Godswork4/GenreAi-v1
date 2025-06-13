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
      include: ['crypto', 'stream', 'buffer', 'util', 'process'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    })
  ],
  define: {
    'process.env.NODE_DEBUG': 'false',
    'global': 'globalThis',
  },
  server: {
    port: 3000,
    host: 'localhost',
    strictPort: true,
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['X-Client-Info', 'Content-Type', 'Authorization'],
      credentials: true
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Client-Info, Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Content-Security-Policy': `
        default-src 'self' chrome-extension: https: http: ws: wss:;
        script-src 'self' 'unsafe-eval' 'unsafe-inline' chrome-extension:;
        connect-src 'self' https: wss: chrome-extension: http: ws:;
        img-src 'self' data: https: chrome-extension:;
        style-src 'self' 'unsafe-inline' chrome-extension:;
        frame-src 'self' chrome-extension:;
        worker-src 'self' blob: chrome-extension:;
      `.replace(/\s+/g, ' ').trim()
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'bn.js': path.resolve(__dirname, 'node_modules/bn.js/lib/bn.js'),
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
      buffer: 'buffer/',
      util: 'util/',
      process: 'process/browser',
    },
    dedupe: ['bn.js', 'wagmi', 'viem'],
  },
  optimizeDeps: {
    include: [
      '@polkadot/util-crypto',
      '@polkadot/wasm-crypto',
      '@polkadot/wasm-crypto-wasm',
      '@polkadot/wasm-crypto-asmjs'
    ],
    exclude: [],
    esbuildOptions: {
      target: 'esnext',
      supported: {
        bigint: true
      }
    }
  },
  build: {
    target: 'esnext',
    sourcemap: true,
    assetsInlineLimit: 0,
    modulePreload: {
      polyfill: true
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'web3-vendor': ['wagmi', 'viem'],
          'ui-vendor': ['framer-motion', '@heroicons/react'],
          'polkadot-vendor': [
            '@polkadot/util-crypto',
            '@polkadot/api',
            '@polkadot/keyring',
            '@polkadot/wasm-crypto',
            '@polkadot/wasm-crypto-wasm',
            '@polkadot/wasm-crypto-asmjs'
          ]
        }
      }
    }
  }
});