# MapLibre GL Style Switcher Example

This example demonstrates how to integrate the `map-gl-style-switcher` control directly with MapLibre GL using vanilla React and manual control integration, featuring modern UI with system theme detection.

## Features

- ⚡ **Vite** - Fast development and build tool
- ⚛️ **React 18** - Latest React with TypeScript
- 🗺️ **MapLibre GL** - Direct MapLibre GL integration
- 🎨 **Style Switcher** - Interactive basemap style switching control
- 🌙 **Dark Mode Support** - Automatic system theme detection
- 🌍 **RTL Support** - Arabic/Hebrew text rendering support
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
import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import { StyleSwitcherControl, type StyleItem } from 'map-gl-style-switcher';
import 'maplibre-gl/dist/maplibre-gl.css';
import 'map-gl-style-switcher/dist/map-gl-style-switcher.css';

// Register RTL text plugin for proper Arabic script rendering
maplibregl.setRTLTextPlugin(
  'https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.3.0/dist/mapbox-gl-rtl-text.js',
  false
);

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
  const mapContainer = useRef<HTMLDivElement | null>(null);
  
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

  useEffect(() => {
    if (!mapContainer.current) return;
    
    const currentStyle = mapStyles[0];
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: currentStyle.styleUrl,
      center: [55.2708, 25.2048], // Dubai, UAE
      zoom: 10,
      attributionControl: false,
    });

    // Add navigation control
    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    
    // Add attribution control
    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      'bottom-right'
    );

    // Add style switcher control
    const styleSwitcher = new StyleSwitcherControl({
      styles: mapStyles,
      theme: 'auto',
      showLabels: true,
      showImages: true,
      activeStyleId: currentStyle.id,
      onBeforeStyleChange: (from, to) => {
        console.log(`Changing style from ${from.name} to ${to.name}`);
      },
      onAfterStyleChange: (_from, to) => {
        map.setStyle(to.styleUrl);
        console.log(`Style changed to ${to.name}`);
      },
    });
    map.addControl(styleSwitcher, 'bottom-left');

    return () => {
      map.remove();
    };
  }, []);

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
        Maplibre Demo
      </h1>
      <div
        ref={mapContainer}
        style={{
          width: '100%',
          height: '100%',
          flex: 1,
          border: isDarkMode ? '1px solid #444' : '1px solid #ddd',
          borderRadius: '12px',
          boxShadow: isDarkMode
            ? '0 4px 12px rgba(0, 0, 0, 0.3)'
            : '0 4px 12px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          minHeight: '500px',
          transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
        }}
      />
    </div>
  );
}
```

### Key Features Demonstrated

1. **Direct MapLibre Integration**: Manual control addition using the native MapLibre GL API
2. **System Theme Detection**: Automatically detects and responds to system dark/light mode
3. **RTL Text Support**: Includes Arabic/Hebrew text rendering plugin
4. **Responsive UI**: Container and text adapt to theme changes with smooth transitions
5. **Enhanced Callbacks**: Both `onBeforeStyleChange` and `onAfterStyleChange` callbacks
6. **Auto Theme**: Style switcher uses `theme="auto"` for automatic theme detection — reacts to OS preference changes in real time without any extra code
7. **Imperative Updates**: Use `control.updateOptions({ activeStyleId, theme })` to update the control programmatically after it has been added to the map
8. **Full TypeScript Support**: Complete type safety with proper interfaces
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
- **Auto Style Switcher**: The control itself uses `theme="auto"` for automatic theming — it registers a `matchMedia` change listener internally and updates its appearance without any extra code in your app

Try changing your system's dark/light mode to see the example adapt in real-time!

## RTL Text Support

This example includes RTL (Right-to-Left) text rendering support:

- **Arabic Script**: Proper rendering of Arabic text labels
- **Hebrew Script**: Support for Hebrew text rendering
- **Automatic Loading**: RTL plugin loads automatically when needed

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
├── App.tsx          # Main application with theme detection and MapLibre integration
├── main.tsx         # React application entry point
└── index.css        # Global styles
```

## Advanced Features

### Theme Integration
- Automatic detection of system dark/light mode preference
- Responsive background and text colors
- Smooth transitions between theme states
- Style switcher control matches application theme

### MapLibre Features
- Direct MapLibre GL integration without wrappers
- Manual control lifecycle management
- Full access to MapLibre GL API
- RTL text plugin for international support

### Error Handling
- Map container validation and error logging
- Style change validation and feedback
- Comprehensive console logging for debugging

### Performance
- Optimized re-renders with proper state management
- Efficient theme detection with cleanup
- Direct MapLibre integration for minimal overhead

## Integration Notes

This example demonstrates the **manual integration approach** using the native MapLibre GL API:

### Import Path
```tsx
import { StyleSwitcherControl } from 'map-gl-style-switcher';
```

### Key Benefits
- **Direct Control**: Full access to MapLibre GL features
- **Minimal Dependencies**: No additional React wrappers required
- **Maximum Flexibility**: Complete control over map initialization
- **RTL Support**: Easy integration of international text rendering
- **Performance**: Direct API usage for optimal performance

### Manual Integration Process
1. **Map Creation**: Create MapLibre GL map instance in `useEffect`
2. **Control Addition**: Add `StyleSwitcherControl` manually to map
3. **Event Handling**: Set up custom callback functions
4. **Cleanup**: Remove map instance on component unmount

### vs. React Component Integration
Unlike the react-map-gl wrapper approach, this method:
- ✅ Full control over map instance and lifecycle
- ✅ Direct access to all MapLibre GL features
- ✅ Better for complex map applications
- ✅ Easier RTL and plugin integration
- ⚠️ Requires manual cleanup and error handling

## Alternative Approaches

For different use cases, consider these other integration methods:

1. **React-Map-GL**: Use `MapGLStyleSwitcher` component for react-map-gl integration
2. **Hook-based**: Use `useStyleSwitcher` for custom map instances
3. **Pure Vanilla**: Use the control in non-React applications

See the [main documentation](../../README.md) for all integration options.

## Learn More

- [Map GL Style Switcher Documentation](../../README.md)
- [MapLibre GL Documentation](https://maplibre.org/maplibre-gl-js/docs/)
- [MapLibre RTL Plugin](https://github.com/mapbox/mapbox-gl-rtl-text)
- [Vite Documentation](https://vitejs.dev/)
