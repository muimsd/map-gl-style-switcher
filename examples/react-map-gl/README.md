# React Map GL Style Switcher Example

This example demonstrates how to integrate the `map-gl-style-switcher` component with `react-map-gl` using MapLibre GL, featuring modern UI with system theme detection.

## Features

- ⚡ **Vite** - Fast development and build tool
- ⚛️ **React 18** - Latest React with TypeScript
- 🗺️ **MapLibre GL** - Open-source map rendering
- 🎯 **react-map-gl** - React wrapper for MapLibre/Mapbox GL
- 🎨 **Style Switcher** - Interactive basemap style switching component
- 🌙 **Dark Mode Support** - Automatic system theme detection
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

### Enhanced Usage with Dark Mode Support

```tsx
import React, { useEffect, useState } from 'react';
import { Map } from 'react-map-gl/maplibre';
import { MapGLStyleSwitcher, type StyleItem } from 'map-gl-style-switcher/react-map-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import 'map-gl-style-switcher/dist/map-gl-style-switcher.css';

const mapStyles: StyleItem[] = [
  {
    id: 'voyager',
    name: 'Voyager',
    image: 'https://raw.githubusercontent.com/muimsd/map-gl-style-switcher/refs/heads/main/public/voyager.png',
    styleUrl: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
    description: 'Balanced, colorful style perfect for data visualization',
  },
  {
    id: 'positron',
    name: 'Positron',
    image: 'https://raw.githubusercontent.com/muimsd/map-gl-style-switcher/refs/heads/main/public/positron.png',
    styleUrl: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    description: 'Clean, minimal light basemap ideal for data overlays',
  },
  {
    id: 'dark-matter',
    name: 'Dark Matter',
    image: 'https://raw.githubusercontent.com/muimsd/map-gl-style-switcher/refs/heads/main/public/dark.png',
    styleUrl: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    description: 'Dark theme perfect for striking data visualizations',
  },
  // ... more styles
];

export default function App() {
  const [mapStyle, setMapStyle] = useState(mapStyles[0].styleUrl);
  const [activeStyleId, setActiveStyleId] = useState(mapStyles[0].id);
  
  // System theme detection
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addEventListener('change', handleThemeChange);
    return () => mediaQuery.removeEventListener('change', handleThemeChange);
  }, []);

  const handleStyleChange = (styleUrl: string) => {
    setMapStyle(styleUrl);
    const style = mapStyles.find(s => s.styleUrl === styleUrl);
    if (style) {
      setActiveStyleId(style.id);
      console.log(`Style changed to: ${style.name}`);
    }
  };

  return (
    <div
      style={{
        padding: '40px',
        backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
        minHeight: '100vh',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        transition: 'background-color 0.3s ease',
      }}
    >
      <h1
        style={{
          textAlign: 'center',
          marginBottom: '30px',
          color: isDarkMode ? '#ffffff' : '#333',
          fontSize: '2rem',
          fontWeight: '600',
          margin: '0 0 30px 0',
          transition: 'color 0.3s ease',
        }}
      >
        React Map GL MapLibre Demo
      </h1>
      <Map
        initialViewState={{
          longitude: -91.874,
          latitude: 42.76,
          zoom: 12,
        }}
        style={{ 
          width: '100%', 
          height: 'calc(100vh - 200px)', 
          borderRadius: '8px' 
        }}
        mapStyle={mapStyle}
      >
        <MapGLStyleSwitcher
          styles={mapStyles}
          activeStyleId={activeStyleId}
          theme="auto"
          showLabels={true}
          showImages={true}
          position="bottom-left"
          onBeforeStyleChange={(from, to) => {
            console.log(`Switching from ${from.name} to ${to.name}`);
          }}
          onStyleChange={handleStyleChange}
        />
      </Map>
    </div>
  );
}
```

### Key Features Demonstrated

1. **System Theme Detection**: Automatically detects and responds to system dark/light mode
2. **Responsive UI**: Container and text adapt to theme changes with smooth transitions
3. **Enhanced Callbacks**: Both `onBeforeStyleChange` and `onStyleChange` callbacks
4. **Auto Theme**: Style switcher uses `theme="auto"` for automatic theme detection
5. **Full TypeScript Support**: Complete type safety with proper interfaces

## Map Styles

The example includes comprehensive basemap styles with high-quality images:

- **Voyager** - Balanced, colorful style perfect for data visualization
- **Positron** - Clean, minimal light basemap ideal for data overlays  
- **Dark Matter** - Dark theme perfect for striking data visualizations
- **ArcGIS Hybrid** - Satellite hybrid style with labels from ESRI
- **OSM** - Open Street Map bright style

All style images are hosted on GitHub and automatically adapt to the current theme.

## Theme Support

The example features automatic system theme detection:

- **System Detection**: Uses `matchMedia('(prefers-color-scheme: dark)')` to detect user preference
- **Responsive UI**: Background, text colors, and layout adapt automatically
- **Smooth Transitions**: All theme changes include smooth 0.3s transitions
- **Auto Style Switcher**: The control itself uses `theme="auto"` for automatic theming

Try changing your system's dark/light mode to see the example adapt in real-time!

## Usage

The style switcher appears in the bottom-left corner of the map with the following features:

- **Hover to Expand**: Hover over the control to see all available styles
- **Visual Previews**: Each style shows a preview image and name
- **Smooth Animations**: Style transitions include loading animations
- **Theme Aware**: Control appearance automatically matches system theme
- **Accessibility**: Full keyboard navigation and screen reader support

## Project Structure

```
src/
├── App.tsx          # Main application with theme detection
├── main.tsx         # React application entry point
└── index.css        # Global styles
```

## Advanced Features

### Theme Integration
- Automatic detection of system dark/light mode preference
- Responsive background and text colors
- Smooth transitions between theme states
- Style switcher control matches application theme

### Error Handling
- Map load error detection and logging
- Style change validation and feedback
- Comprehensive console logging for debugging

### Performance
- Optimized re-renders with proper state management
- Efficient theme detection with cleanup
- Minimal bundle size with tree-shaking support

## Integration Notes

This example demonstrates the **react-map-gl integration approach** using the dedicated React component:

### Import Path
```tsx
import { MapGLStyleSwitcher } from 'map-gl-style-switcher/react-map-gl';
```

### Key Benefits
- **React Native**: Built specifically for react-map-gl integration
- **Automatic Cleanup**: Handles control lifecycle automatically
- **Type Safety**: Full TypeScript support with proper prop types
- **Theme Support**: Built-in dark/light/auto theme detection
- **Event Handling**: React-friendly callback patterns

### vs. Manual Integration
Unlike manual control addition, this approach:
- ✅ No need for `useEffect` hooks to add/remove controls
- ✅ Automatic prop updates and re-rendering
- ✅ Proper React lifecycle management
- ✅ Better TypeScript integration
- ✅ Consistent with React patterns

## Alternative Approaches

For different use cases, consider these other integration methods:

1. **Hook-based**: Use `useStyleSwitcher` for custom map instances
2. **Manual Control**: Add `StyleSwitcherControl` directly to map instance
3. **Pure Component**: Use the vanilla JavaScript control

See the [main documentation](../../README.md) for all integration options.

## Learn More

- [Map GL Style Switcher Documentation](../../README.md)
- [react-map-gl Documentation](https://visgl.github.io/react-map-gl/)
- [MapLibre GL Documentation](https://maplibre.org/maplibre-gl-js/docs/)
- [Vite Documentation](https://vitejs.dev/)
