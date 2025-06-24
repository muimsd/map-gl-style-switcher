# React Map GL Style Switcher Example

This example demonstrates how to integrate the `map-gl-style-switcher` component with `react-map-gl` using MapLibre GL.

## Features

- ⚡ **Vite** - Fast development and build tool
- ⚛️ **React 18** - Latest React with TypeScript
- 🗺️ **MapLibre GL** - Open-source map rendering
- 🎯 **react-map-gl** - React wrapper for MapLibre/Mapbox GL
- 🎨 **Style Switcher** - Interactive basemap style switching component
- 📱 **Responsive** - Works on desktop and mobile
- 🔧 **TypeScript** - Full type safety
- ✅ **Production Ready** - Fully tested integration

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Integration Guide

### Basic Usage

```tsx
import React, { useState } from 'react';
import { Map } from 'react-map-gl/maplibre';
import { MapGLStyleSwitcher, type StyleItem } from 'map-gl-style-switcher';
import 'maplibre-gl/dist/maplibre-gl.css';
import 'map-gl-style-switcher/dist/map-gl-style-switcher.css';

const mapStyles: StyleItem[] = [
  {
    id: 'voyager',
    name: 'Voyager',
    image: '/voyager.png',
    styleUrl: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
    description: 'Balanced, colorful style perfect for data visualization',
  },
  // ... more styles
];

export default function App() {
  const [mapStyle, setMapStyle] = useState(mapStyles[0].styleUrl);
  const [activeStyleId, setActiveStyleId] = useState(mapStyles[0].id);

  const handleStyleChange = (styleUrl: string) => {
    setMapStyle(styleUrl);
    const style = mapStyles.find(s => s.styleUrl === styleUrl);
    if (style) {
      setActiveStyleId(style.id);
    }
  };

  return (
    <Map
      initialViewState={{ longitude: -91.874, latitude: 42.76, zoom: 12 }}
      style={{ width: '100%', height: '100vh' }}
      mapStyle={mapStyle}
    >
      <MapGLStyleSwitcher
        styles={mapStyles}
        activeStyleId={activeStyleId}
        theme="auto"
        position="bottom-left"
        onStyleChange={handleStyleChange}
      />
    </Map>
  );
}
```

### Key Points

1. **CSS Imports**: Always import both MapLibre and style switcher CSS
2. **Map Import**: Use `import { Map } from 'react-map-gl/maplibre'`
3. **Child Component**: Place `MapGLStyleSwitcher` as a child of `Map`
4. **Controlled State**: Manage `mapStyle` and `activeStyleId` with useState
5. **Style Definition**: Define styles with all required `StyleItem` properties

## Map Styles

The example includes several basemap styles:

- **Voyager** - Balanced, colorful style perfect for data visualization
- **Positron** - Clean, minimal light basemap ideal for data overlays  
- **Dark Matter** - Dark theme perfect for striking data visualizations
- **OSM Bright** - Open Street Map bright style

## Usage

The style switcher appears in the bottom-left corner of the map. Hover over it to see available styles and click to switch between them.

## Project Structure

```
src/
├── App.tsx          # Main application component
├── main.tsx         # React application entry point
└── index.css        # Global styles
```

## Integration Notes

This example demonstrates the direct integration approach where the `StyleSwitcherControl` is added manually to the map using the native MapLibre GL API through react-map-gl's map reference.

The control is added in a `useEffect` hook when the map loads and properly cleaned up when the component unmounts.

## Learn More

- [Map GL Style Switcher Documentation](../../README.md)
- [react-map-gl Documentation](https://visgl.github.io/react-map-gl/)
- [MapLibre GL Documentation](https://maplibre.org/maplibre-gl-js/docs/)
- [Vite Documentation](https://vitejs.dev/)
