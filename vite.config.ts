import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Relative asset paths make the static build work on GitHub Pages project sites.
  base: './',
  plugins: [react(), tailwindcss()],
});
