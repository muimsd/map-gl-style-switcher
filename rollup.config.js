import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import { dts } from 'rollup-plugin-dts';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'));

// Custom plugin to copy CSS without minification
const copyCSS = () => ({
  name: 'copy-css',
  buildStart() {
    // Ensure dist directory exists
    if (!existsSync('dist')) {
      mkdirSync('dist', { recursive: true });
    }
    // Read and copy CSS file as-is
    const cssContent = readFileSync('src/styles/style-switcher.css', 'utf8');
    writeFileSync('dist/map-gl-style-switcher.css', cssContent);
    console.log('✓ CSS file copied to dist/map-gl-style-switcher.css');
  }
});

// ES modules build configuration with multiple entry points
const esConfig = {
  input: {
    index: 'src/index.ts',
    react: 'src/react.ts',
    'react-map-gl': 'src/react-map-gl.ts'
  },
  external: ['mapbox-gl', 'maplibre-gl', 'react', 'react-dom', 'react-map-gl', 'react-map-gl/maplibre'],
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: true,
    exports: 'named',
    entryFileNames: '[name].js'
  },
  plugins: [
    copyCSS(), // Copy CSS first
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    typescript({
      tsconfig: './tsconfig.build.json',
      declaration: false, // We'll generate declarations separately
      outDir: 'dist',
      rootDir: 'src'
    })
  ],
  onwarn(warning, warn) {
    // Suppress certain warnings
    if (warning.code === 'THIS_IS_UNDEFINED') return;
    if (warning.code === 'EMPTY_BUNDLE') return;
    warn(warning);
  }
};

// UMD build for main entry only (for CDN usage)
const umdConfig = {
  input: 'src/index.ts',
  external: ['mapbox-gl', 'maplibre-gl', 'react', 'react-dom', 'react-map-gl', 'react-map-gl/maplibre'],
  output: {
    file: 'dist/index.umd.js',
    format: 'umd',
    name: 'mapglstyleswitcher',
    sourcemap: true,
    exports: 'named',
    globals: {
      'mapbox-gl': 'mapboxgl',
      'maplibre-gl': 'maplibregl',
      'react': 'React',
      'react-dom': 'ReactDOM',
      'react-map-gl': 'ReactMapGL',
      'react-map-gl/maplibre': 'ReactMapGL'
    }
  },
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    typescript({
      tsconfig: './tsconfig.build.json',
      declaration: false,
      outDir: 'dist',
      rootDir: 'src'
    })
  ],
  onwarn(warning, warn) {
    if (warning.code === 'THIS_IS_UNDEFINED') return;
    if (warning.code === 'EMPTY_BUNDLE') return;
    warn(warning);
  }
};

// Type definitions build
const dtsConfig = {
  input: {
    index: 'src/index.ts',
    react: 'src/react.ts',
    'react-map-gl': 'src/react-map-gl.ts'
  },
  output: {
    dir: 'dist',
    format: 'es',
    entryFileNames: '[name].d.ts'
  },
  plugins: [
    dts({
      tsconfig: './tsconfig.build.json'
    })
  ],
  external: ['mapbox-gl', 'maplibre-gl', 'react', 'react-dom', 'react-map-gl', 'react-map-gl/maplibre']
};

export default [esConfig, umdConfig, dtsConfig];
