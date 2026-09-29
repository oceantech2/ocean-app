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

// Sem index.html no dist: a Vercel serve arquivos físicos antes dos rewrites, e um index.html
// na raiz faria "/" abrir o ERP também em proposal.oceantalentsolutions.com.
function erpHtmlSemIndex(): Plugin {
  return {
    name: 'erp-html-sem-index',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, bundle) {
      const html = bundle['index.html']
      if (!html || html.type !== 'asset') return
      delete bundle['index.html']
      this.emitFile({ type: 'asset', fileName: 'app.html', source: html.source })
    },
  }
}

export default defineConfig({
  plugins: [react(), proposalHostDev(), erpHtmlSemIndex()],
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
