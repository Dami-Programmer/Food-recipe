import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import recipeHandler from './netlify/functions/recipe.mjs'

// On Netlify, netlify/functions/recipe.mjs answers /api/recipe.
// This plugin runs the same function during `npm run dev`,
// so the app works locally without installing the Netlify CLI.
function localRecipeApi() {
  return {
    name: 'local-recipe-api',
    configureServer(server) {
      server.middlewares.use('/api/recipe', async (req, res) => {
        const chunks = []
        for await (const chunk of req) chunks.push(chunk)

        const request = new Request('http://localhost/api/recipe', {
          method: req.method,
          headers: { 'Content-Type': req.headers['content-type'] ?? '' },
          body: req.method === 'POST' ? Buffer.concat(chunks) : undefined,
        })
        const response = await recipeHandler(request)

        res.statusCode = response.status
        res.setHeader('Content-Type', 'application/json')
        res.end(await response.text())
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load HUGGINGFACE_API_KEY from .env for the local function only.
  // It has no VITE_ prefix, so Vite never puts it in the browser bundle.
  const env = loadEnv(mode, process.cwd(), '')
  process.env.HUGGINGFACE_API_KEY ??= env.HUGGINGFACE_API_KEY

  return {
    plugins: [react(), localRecipeApi()],
  }
})
