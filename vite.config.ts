import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    port: 5173,
    host: true,
    strictPort: false,
    hmr: { overlay: true },
  },
  optimizeDeps: {
    include: ['react-router-dom'],
    exclude: ['react-beautiful-dnd'], // belt + braces
  },
});
