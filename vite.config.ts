import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: "src/index.ts",
      name: "MapGLStyleChanger",
      fileName: (format) => `index.${format === 'es' ? 'js' : format}`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['mapbox-gl', 'maplibre-gl'],
      output: {
        globals: {
          'mapbox-gl': 'mapboxgl',
          'maplibre-gl': 'maplibregl'
        }
      }
    },
    sourcemap: true,
    emptyOutDir: true
  }
});
