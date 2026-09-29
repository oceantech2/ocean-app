import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Em dev, proposal.localhost:5193 serve o app do Proposal (espelha o rewrite por host do vercel.json).
function proposalHostDev(): Plugin {
  return {
    name: 'proposal-host-dev',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const host = req.headers.host ?? ''
        const url = req.url ?? '/'
        const caminho = url.split('?')[0]
        const ehInterno = /^\/(@|src\/|node_modules\/|api\/)/.test(caminho)
        const temExtensao = /\.[a-zA-Z0-9]+$/.test(caminho)
        if (host.startsWith('proposal.') && !ehInterno && !temExtensao) {
          req.url = '/proposal.html'
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), proposalHostDev()],
  server: {
    port: 5193,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: 'index.html',
        proposal: 'proposal.html',
      },
    },
  }
})
