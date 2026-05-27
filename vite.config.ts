import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env (including non-VITE_ ones).
  const env = loadEnv(mode, process.cwd(), '');
  const BACKEND_URL = env.VITE_PROXY_TARGET || 'http://localhost:5000';

  return {
    plugins: [tailwindcss(), react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src/app'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: BACKEND_URL,
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (_proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);        
            });
          },
          // If your backend does NOT have /api in its routes, uncomment the next line:
          // rewrite: (path) => path.replace(/^\/api/, '')
        },
      },
    },
    optimizeDeps: {
      include: ['recharts', 'react-is'],
    },
  }
})
