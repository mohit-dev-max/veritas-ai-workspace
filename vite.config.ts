import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: /^(\.\.?\/)+components\/(.*)$/, replacement: path.resolve(__dirname, 'src/$2') },
      { find: /^(\.\.?\/)+config\/(.*)$/, replacement: path.resolve(__dirname, 'src/$2') },
      { find: /^(\.\.?\/)+types\/(.*)$/, replacement: path.resolve(__dirname, 'src/$2') },
      { find: '@', replacement: path.resolve(__dirname, 'src') },
    ],
  },
});
