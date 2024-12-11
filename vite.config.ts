import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { peerDependencies } from './package.json';

// https://vite.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'vite-react-ts-button',
      fileName: (format) => `index.${format}.js`,
      formats: ['cjs', 'es'],
    },
    rollupOptions: {
      external: [...Object.keys(peerDependencies)],
    },
    sourcemap: true,
    emptyOutDir: true,
  },
  plugins: [react()],
});
