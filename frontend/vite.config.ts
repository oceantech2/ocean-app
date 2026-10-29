import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import prerenderSite from './site-prerender'

// Em dev, proposal.localhost:5193 (cliente) e consultantpanel.localhost:5193 (painel) servem o app do
// Proposal e site.localhost:5193 serve o site institucional (espelha o rewrite por host do vercel.json).
function hostsDev(): Plugin {
  return {
    name: 'hosts-dev',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const host = req.headers.host ?? ''
        const url = req.url ?? '/'
        const caminho = url.split('?')[0]
        const ehInterno = /^\/(@|src\/|node_modules\/|api\/)/.test(caminho)
        const temExtensao = /\.[a-zA-Z0-9]+$/.test(caminho)
        if (!ehInterno && !temExtensao) {
          if (host.startsWith('proposal.') || host.startsWith('consultantpanel.')) {
            req.url = '/proposal.html'
          } else if (host.startsWith('site.')) {
            req.url = '/site.html'
          }
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
  plugins: [react(), hostsDev(), erpHtmlSemIndex(), prerenderSite()],
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
        site: 'site.html',
      },
    },
  }
})
