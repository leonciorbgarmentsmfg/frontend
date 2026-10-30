import { createReadStream, copyFileSync, existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const frontendRoot = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(frontendRoot, '..')
const projectRoot = existsSync(path.join(workspaceRoot, 'node_modules', 'tesseract.js'))
  ? workspaceRoot
  : frontendRoot
const ocrAssets = {
  'worker.min.js': path.join(projectRoot, 'node_modules', 'tesseract.js', 'dist', 'worker.min.js'),
  'tesseract-core-lstm.wasm.js': path.join(projectRoot, 'node_modules', 'tesseract.js-core', 'tesseract-core-lstm.wasm.js'),
  'tesseract-core-lstm.wasm': path.join(projectRoot, 'node_modules', 'tesseract.js-core', 'tesseract-core-lstm.wasm'),
  'eng.traineddata.gz': path.join(projectRoot, 'node_modules', '@tesseract.js-data', 'eng', '4.0.0_best_int', 'eng.traineddata.gz'),
  'tesseract.js-LICENSE.txt': path.join(projectRoot, 'node_modules', 'tesseract.js', 'LICENSE.md'),
  'tesseract.js-core-LICENSE.txt': path.join(projectRoot, 'node_modules', 'tesseract.js-core', 'LICENSE'),
}

function localOcrAssets() {
  let outputDirectory
  return {
    name: 'bpsms-local-ocr-assets',
    configResolved(config) {
      outputDirectory = path.resolve(config.root, config.build.outDir)
    },
    configureServer(server) {
      server.middlewares.use('/ocr', (request, response, next) => {
        const fileName = path.basename(new URL(request.url, 'http://localhost').pathname)
        const assetPath = ocrAssets[fileName]
        if (!assetPath) return next()
        response.setHeader(
          'Content-Type',
          fileName.endsWith('.wasm')
            ? 'application/wasm'
            : fileName.endsWith('.gz')
              ? 'application/gzip'
              : 'text/javascript; charset=utf-8',
        )
        createReadStream(assetPath).on('error', next).pipe(response)
      })
    },
    closeBundle() {
      const destination = path.join(outputDirectory, 'ocr')
      mkdirSync(destination, { recursive: true })
      for (const [fileName, source] of Object.entries(ocrAssets)) {
        copyFileSync(source, path.join(destination, fileName))
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localOcrAssets()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})
