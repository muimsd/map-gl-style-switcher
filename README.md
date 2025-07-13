# Map GL Style Switcher

[![npm version](https://badge.fury.io/js/map-gl-style-switcher.svg)](https://badge.fury.io/js/map-gl-style-switcher)
[![CI](https://github.com/muimsd/map-gl-style-switcher/actions/workflows/ci.yml/badge.svg)](https://github.com/muimsd/map-gl-style-switcher/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Netlify Status](https://api.netlify.com/api/v1/badges/ea3ee6af-161d-46be-9006-9d31ad52da3c/deploy-status)](https://app.netlify.com/projects/map-gl-style-switcher/deploys)

<!-- [![Coverage Status](https://codecov.io/gh/muimsd/map-gl-style-switcher/branch/main/graph/badge.svg)](https://codecov.io/gh/muimsd/map-gl-style-switcher) -->

A TypeScript control for switching Mapbox GL / MapLibre GL map styles. Easily add a floating style switcher to your map app, with support for multiple styles, images, dark/light themes, and before/after change callbacks.

**Available as:**

- `StyleSwitcherControl` - Direct IControl implementation for Mapbox/MapLibre GL
- `MapGLStyleSwitcher` - React component for react-map-gl integration
  _Live demo of the style switcher control in action_

**<a href="https://map-gl-style-switcher.netlify.app/" target="_blank">🌐 Live Demo</a>**

## Animated Demo

![Demo GIF](./images/demo.gif)

## Available Styles

![Available Styles](./images/styles.png)

## Features

- IControl implementation for Mapbox GL / MapLibre GL
- **React component for react-map-gl integration**
- Floating style switcher in any corner (via map.addControl position)
- Support for multiple map styles with thumbnails
- Expand/collapse on hover with smooth animations
- Dark/light/auto theme support
- RTL text support for Arabic scripts
- Configurable display options (show/hide labels and images)
- Callbacks for before/after style change
- Fully customizable CSS classes
- TypeScript support
- Accessibility features (ARIA labels, keyboard navigation)
- Comprehensive test coverage

## Install

```sh
# Using npm (recommended)
npm install map-gl-style-switcher

# Using yarn
yarn add map-gl-style-switcher

# Using pnpm
pnpm add map-gl-style-switcher
```

## CDN Usage

For quick prototyping or when you don't want to use a build system, you can include the package directly from a CDN:

### unpkg CDN and jsDelivr CDN

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- jsDelivr CDN -->
    <!-- MapLibre GL CSS -->
    <!-- <link href="https://cdn.jsdelivr.net/npm/maplibre-gl@4/dist/maplibre-gl.css" rel="stylesheet" /> -->

    <!-- Style Switcher CSS -->
    <!-- <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/map-gl-style-switcher@latest/dist/map-gl-style-switcher.css"
    /> -->
    <!-- MapLibre GL CSS -->
    <link href="https://unpkg.com/maplibre-gl@4/dist/maplibre-gl.css" rel="stylesheet" />

    <!-- Style Switcher CSS -->
    <link
      rel="stylesheet"
      href="https://unpkg.com/map-gl-style-switcher@latest/dist/map-gl-style-switcher.css"
    />
  </head>
  <body>
    <div id="map" style="width: 100%; height: 100vh;"></div>
    <!-- jsDelivr CDN -->
    <!-- MapLibre GL JS -->
    <!-- <script src="https://cdn.jsdelivr.net/npm/maplibre-gl@4/dist/maplibre-gl.js"></script> -->

    <!-- Style Switcher UMD -->
    <!-- <script src="https://cdn.jsdelivr.net/npm/map-gl-style-switcher@latest/dist/index.umd.js"></script> -->
    <!-- MapLibre GL JS -->
    <script src="https://unpkg.com/maplibre-gl@4/dist/maplibre-gl.js"></script>

    <!-- Style Switcher UMD -->
    <script src="https://unpkg.com/map-gl-style-switcher@latest/dist/index.umd.js"></script>

    <script>
      // StyleSwitcherControl is available globally as MapGLStyleSwitcher.StyleSwitcherControl
      const { StyleSwitcherControl } = MapGLStyleSwitcher;

      const styles = [
        {
          id: 'voyager',
          name: 'Voyager',
          image: 'https://github.com/muimsd/map-gl-style-switcher/tree/main/public/voyager.png',
          styleUrl: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
          description: 'Voyager style from Carto',
        },
        {
          id: 'positron',
          name: 'Positron',
          image: 'https://github.com/muimsd/map-gl-style-switcher/tree/main/public/positron.png',
          styleUrl: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
          description: 'Positron style from Carto',
        },
      ];

      const map = new maplibregl.Map({
        container: 'map',
        style: styles[0].styleUrl,
        center: [0, 0],
        zoom: 2,
      });

      const styleSwitcher = new StyleSwitcherControl({
        styles: styles,
        theme: 'auto',
        activeStyleId: styles[0].id,
        onAfterStyleChange: (from, to) => {
          map.setStyle(to.styleUrl);
        },
      });

      map.addControl(styleSwitcher, 'bottom-left');
    </script>
  </body>
</html>
```

### ES Modules from CDN

For modern browsers that support ES modules:

```html
<script type="module">
  import { StyleSwitcherControl } from 'https://unpkg.com/map-gl-style-switcher@latest/dist/index.js';

  // Your code here
  const styleSwitcher = new StyleSwitcherControl({
    styles: styles,
    theme: 'auto',
  });
</script>
```

### Entry Point Guide

#### For Vanilla JavaScript/TypeScript Users

```ts
import { StyleSwitcherControl } from 'map-gl-style-switcher';
// No React dependencies required
```

#### For React with Custom Map Instance

```tsx
import { useStyleSwitcher } from 'map-gl-style-switcher/react';
// Pure React hook - works with any map instance (MapLibre, Mapbox, etc.)
// Only requires: react (no react-map-gl dependency)
```

#### For React with react-map-gl

```tsx
import { MapGLStyleSwitcher } from 'map-gl-style-switcher/react-map-gl';
// React component using react-map-gl's useControl
// Requires: react + react-map-gl
```

### Basic MapLibre GL Integration

```ts
import maplibregl from 'maplibre-gl';
import { StyleSwitcherControl } from 'map-gl-style-switcher';
import 'map-gl-style-switcher/dist/map-gl-style-switcher.css';

// Define styles
const styles = [
  {
    id: 'voyager',
    name: 'Voyager',
    image: 'https://github.com/muimsd/map-gl-style-switcher/tree/main/public/voyager.png',
    styleUrl: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
    description: 'Voyager style from Carto',
  },
  {
    id: 'positron',
    name: 'Positron',
    image: 'https://github.com/muimsd/map-gl-style-switcher/tree/main/public/positron.png',
    styleUrl: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    description: 'Positron style from Carto',
  },
  {
    id: 'dark-matter',
    name: 'Dark Matter',
    image: 'https://github.com/muimsd/map-gl-style-switcher/tree/main/public/dark.png',
    styleUrl: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    description: 'Dark style from Carto',
  },
  {
    id: 'arcgis-hybrid',
    name: 'ArcGIS Hybrid',
    image: 'https://github.com/muimsd/map-gl-style-switcher/tree/main/public/arcgis-hybrid.png',
    styleUrl:
      'https://raw.githubusercontent.com/go2garret/maps/main/src/assets/json/arcgis_hybrid.json',
    description: 'Hybrid Satellite style from ESRI',
  },
  {
    id: 'osm',
    name: 'OSM',
    image: 'https://github.com/muimsd/map-gl-style-switcher/tree/main/public/osm.png',
    styleUrl:
      'https://raw.githubusercontent.com/go2garret/maps/main/src/assets/json/openStreetMap.json',
    description: 'OSM style',
  },
];
const defaultStyle = styles[0];
// Create map
const map = new maplibregl.Map({
  container: 'map',
  style: defaultStyle.styleUrl,
  center: [0, 0],
  zoom: 2,
});

// Add style switcher control
const styleSwitcher = new StyleSwitcherControl({
  styles: styles,
  theme: 'light', // 'light', 'dark', or 'auto'
  showLabels: true,
  showImages: true,
  activeStyleId: defaultStyle.id,
  onBeforeStyleChange: (from, to) => {
    console.log(`Switching from ${from.name} to ${to.name}`);
  },
  onAfterStyleChange: (from, to) => {
    map.setStyle(to.styleUrl);
  },
});

map.addControl(styleSwitcher, 'bottom-left');
```

### React Hook for Custom Map Instances

For React applications where you manage the map instance yourself (e.g., with `useEffect`), use the `useStyleSwitcher` hook:

```tsx
import React, { useEffect, useRef } from 'react';
import { useStyleSwitcher } from 'map-gl-style-switcher/react';
import maplibregl from 'maplibre-gl';
import 'map-gl-style-switcher/dist/map-gl-style-switcher.css';

const styles = [
  {
    id: 'voyager',
    name: 'Voyager',
    image: 'https://github.com/muimsd/map-gl-style-switcher/tree/main/public/voyager.png',
    styleUrl: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
    description: 'Voyager style from Carto',
  },
  {
    id: 'positron',
    name: 'Positron',
    image: 'https://github.com/muimsd/map-gl-style-switcher/tree/main/public/positron.png',
    styleUrl: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    description: 'Positron style from Carto',
  },
];

function MyMapComponent() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: styles[0].styleUrl,
      center: [0, 0],
      zoom: 2,
    });

    return () => map.current?.remove();
  }, []);

  // Add style switcher control to the map
  useStyleSwitcher(map.current, {
    styles,
    theme: 'auto',
    position: 'top-right',
    onAfterStyleChange: (from, to) => {
      if (map.current) {
        map.current.setStyle(to.styleUrl);
      }
    },
  });

  return <div ref={mapContainer} style={{ width: '100%', height: '400px' }} />;
}
```

### React Integration with react-map-gl

For React applications using `react-map-gl`, this package provides a ready-to-use `MapGLStyleSwitcher` component:

```tsx
import React, { useState } from 'react';
import { Map } from 'react-map-gl/maplibre';
import { MapGLStyleSwitcher } from 'map-gl-style-switcher/react-map-gl';
import 'map-gl-style-switcher/dist/map-gl-style-switcher.css';

const styles = [
  {
    id: 'voyager',
    name: 'Voyager',
    image: 'https://github.com/muimsd/map-gl-style-switcher/tree/main/public/voyager.png',
    styleUrl: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
    description: 'Voyager style from Carto',
  },
  {
    id: 'positron',
    name: 'Positron',
    image: 'https://github.com/muimsd/map-gl-style-switcher/tree/main/public/positron.png',
    styleUrl: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    description: 'Positron style from Carto',
  },
  {
    id: 'dark-matter',
    name: 'Dark Matter',
    image: 'https://github.com/muimsd/map-gl-style-switcher/tree/main/public/dark.png',
    styleUrl: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    description: 'Dark style from Carto',
  },
  {
    id: 'arcgis-hybrid',
    name: 'ArcGIS Hybrid',
    image: 'https://github.com/muimsd/map-gl-style-switcher/tree/main/public/arcgis-hybrid.png',
    styleUrl:
      'https://raw.githubusercontent.com/go2garret/maps/main/src/assets/json/arcgis_hybrid.json',
    description: 'Hybrid Satellite style from ESRI',
  },
  {
    id: 'osm',
    name: 'OSM',
    image: 'https://github.com/muimsd/map-gl-style-switcher/tree/main/public/osm.png',
    styleUrl:
      'https://raw.githubusercontent.com/go2garret/maps/main/src/assets/json/openStreetMap.json',
    description: 'OSM style',
  },
];

export const MapComponent = () => {
  const [mapStyle, setMapStyle] = useState(styles[0].styleUrl);

  return (
    <Map
      mapLib={import('maplibre-gl')}
      initialViewState={{
        longitude: 0,
        latitude: 0,
        zoom: 2,
      }}
      style={{ width: '100%', height: '100vh' }}
      mapStyle={mapStyle}
    >
      <MapGLStyleSwitcher
        styles={styles}
        activeStyleId={styles[0].id}
        theme="auto"
        showLabels={true}
        showImages={true}
        onStyleChange={setMapStyle}
        position="bottom-left"
      />
    </Map>
  );
};
```

#### MapGLStyleSwitcher Props

```tsx
interface MapGLStyleSwitcherProps {
  styles: StyleItem[]; // Array of map styles (required)
  activeStyleId?: string; // Currently active style ID
  theme?: 'light' | 'dark' | 'auto'; // UI theme (default: 'light')
  showLabels?: boolean; // Show style names (default: true)
  showImages?: boolean; // Show style thumbnails (default: true)
  position?:
    | 'top-left'
    | 'top-right' // Control position (default: 'bottom-left')
    | 'bottom-left'
    | 'bottom-right';
  animationDuration?: number; // Animation duration in ms (default: 200)
  maxHeight?: number; // Max height of expanded list (default: 300)
  rtl?: boolean; // Enable RTL layout (default: false)
  classNames?: Partial<{
    // Custom CSS classes
    container: string;
    list: string;
    item: string;
    itemSelected: string;
    itemHideLabel: string;
    dark: string;
    light: string;
  }>;
  onBeforeStyleChange?: (from: StyleItem, to: StyleItem) => void; // Callback before style change
  onAfterStyleChange?: (from: StyleItem, to: StyleItem) => void; // Callback after style change
  onStyleChange?: (styleUrl: string) => void; // Simplified callback for style URL
}
```

#### Advanced React Usage

For more complex scenarios, you can use both callbacks:

```tsx
const MapComponent = () => {
  const [mapStyle, setMapStyle] = useState(styles[0].styleUrl);
  const [loading, setLoading] = useState(false);

  const handleBeforeStyleChange = (from: StyleItem, to: StyleItem) => {
    console.log(`Switching from ${from.name} to ${to.name}`);
    setLoading(true);
  };

  const handleAfterStyleChange = (from: StyleItem, to: StyleItem) => {
    console.log(`Style changed to ${to.name}`);
    setLoading(false);
  };

  const handleStyleChange = (styleUrl: string) => {
    setMapStyle(styleUrl);
  };

  return (
    <Map mapStyle={mapStyle} /* ...other props */>
      <MapGLStyleSwitcher
        styles={styles}
        activeStyleId="voyager"
        theme="auto"
        onBeforeStyleChange={handleBeforeStyleChange}
        onAfterStyleChange={handleAfterStyleChange}
        onStyleChange={handleStyleChange}
        position="bottom-left"
      />
      {loading && <div className="loading-indicator">Switching style...</div>}
    </Map>
  );
};
```

**Note:** This hook automatically handles adding/removing the control when the map or options change.

## Examples

### React + Vite + TypeScript Example

A complete working example is available in the `examples/react-map-gl` directory:

```bash
cd examples/react-map-gl
npm install
npm run dev
```

This example demonstrates:

- React 19 with TypeScript and Vite 7
- MapLibre GL integration with react-map-gl
- MapGLStyleSwitcher component usage
- Multiple basemap styles with thumbnails

[View the complete example →](examples/react-map-gl/)

## Configuration Options

```ts
interface StyleSwitcherControlOptions {
  styles: StyleItem[]; // Array of map styles (required)
  activeStyleId?: string; // Currently active style ID (default: first style)
  onBeforeStyleChange?: (from: StyleItem, to: StyleItem) => void; // Callback before style change
  onAfterStyleChange?: (from: StyleItem, to: StyleItem) => void; // Callback after style change
  showLabels?: boolean; // Show style names (default: true)
  showImages?: boolean; // Show style thumbnails (default: true)
  animationDuration?: number; // Animation duration in ms (default: 200)
  maxHeight?: number; // Max height of expanded list (default: 300)
  theme?: 'light' | 'dark' | 'auto'; // UI theme (default: 'light')
  classNames?: Partial<StyleSwitcherClassNames>; // Custom CSS classes
  rtl?: boolean; // Enable RTL layout (default: false)
}

interface StyleItem {
  id: string; // Unique identifier
  name: string; // Display name
  image: string; // Thumbnail URL or data URI
  styleUrl: string; // MapLibre/Mapbox style URL
  description?: string; // Optional tooltip text
}

interface StyleSwitcherClassNames {
  container: string; // Main container class
  list: string; // Expanded list container class
  item: string; // Individual style item class
  itemSelected: string; // Selected style item class
  itemHideLabel: string; // Hide label utility class
  dark: string; // Dark theme class
  light: string; // Light theme class
}
```

_Example of different map styles that can be used with the style switcher_

### Option Details

- **`activeStyleId`**: Controls both the initially selected style and what's displayed in the collapsed state
- **`showLabels`** & **`showImages`**: At least one must be `true`
- **`theme`**:
  - `'light'`: Light color scheme
  - `'dark'`: Dark color scheme
  - `'auto'`: Auto-detect from system preference
- **`rtl`**: Enables right-to-left layout for Arabic/Hebrew interfaces

## Customizing CSS Classes

You can override all CSS classes used by the style switcher control using the `classNames` option:

```ts
import { StyleSwitcherControl } from 'map-gl-style-switcher';

const styleSwitcher = new StyleSwitcherControl({
  styles,
  showLabels: true,
  showImages: true,
  classNames: {
    container: 'my-style-switcher',
    list: 'my-style-list',
    item: 'my-style-item',
    itemSelected: 'my-style-item-selected',
    itemHideLabel: 'my-style-item-hide-label',
    dark: 'my-style-dark',
    light: 'my-style-light',
  },
});
```

See the default class names in the `StyleSwitcherControl` source for all available keys.

## Contributing

We welcome contributions! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup

1. **Clone the repository**

   ```sh
   git clone https://github.com/muimsd/map-gl-style-switcher
   cd map-gl-style-switcher
   ```

2. **Install dependencies**

   ```sh
   npm install
   ```

3. **Start development server**

   ```sh
   npm run dev
   ```

4. **Make your changes**
   - Follow TypeScript best practices
   - Maintain backward compatibility when possible
   - Add tests for new features

5. **Test your changes**

   ```sh
   npm run validate  # Runs type-check, lint, format-check, and tests
   ```

6. **Submit a pull request**

### Guidelines

- Use npm for dependency management
- Follow TypeScript best practices
- Maintain backward compatibility when possible
- Add tests for new features
- Update documentation as needed
- Follow the existing code style
- Ensure all checks pass: `npm run validate`

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Author

**Muhammad Imran Siddique**

- GitHub: [@muimsd](https://github.com/muimsd)

## Repository

- GitHub: [https://github.com/muimsd/map-gl-style-switcher](https://github.com/muimsd/map-gl-style-switcher)
- Issues: [https://github.com/muimsd/map-gl-style-switcher/issues](https://github.com/muimsd/map-gl-style-switcher/issues)

---

Made with ❤️ for the MapLibre GL and Mapbox GL community
