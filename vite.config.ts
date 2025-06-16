import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  
  // Development server configuration
  server: {
    port: 5173,
    host: true,
    open: true
  },
  
  // Build configuration for demo
  build: {
    outDir: 'dist-demo',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          maplibre: ['maplibre-gl']
        }
      }
    }
  },
  
  // Optimize dependencies for better performance in development
  optimizeDeps: {
    include: ['maplibre-gl', 'react', 'react-dom']
  }
});
