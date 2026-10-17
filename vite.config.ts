import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {buildSeoBody} from './scripts/seoBody.mjs';

export default defineConfig(() => {
  return {
    base: '/tool17/',
    build: {
      outDir: 'dist/tool17',
      emptyOutDir: true,
    },
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'seo-body',
        transformIndexHtml(html: string) {
          return html.replace('<!--SEO_BODY-->', () => buildSeoBody(__dirname));
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
