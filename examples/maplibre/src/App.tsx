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
    image:
      'https://raw.githubusercontent.com/muimsd/map-gl-style-switcher/refs/heads/main/public/voyager.png',
    styleUrl: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
    description: 'Voyager style from Carto',
  },
  {
    id: 'positron',
    name: 'Positron',
    image:
      'https://raw.githubusercontent.com/muimsd/map-gl-style-switcher/refs/heads/main/public/positron.png',
    styleUrl: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    description: 'Positron style from Carto',
  },
  {
    id: 'dark-matter',
    name: 'Dark Matter',
    image:
      'https://raw.githubusercontent.com/muimsd/map-gl-style-switcher/refs/heads/main/public/dark.png',
    styleUrl:
      'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    description: 'Dark style from Carto',
  },
  {
    id: 'arcgis-hybrid',
    name: 'ArcGIS Hybrid',
    image:
      'https://raw.githubusercontent.com/muimsd/map-gl-style-switcher/refs/heads/main/public/arcgis-hybrid.png',
    styleUrl:
      'https://raw.githubusercontent.com/go2garret/maps/main/src/assets/json/arcgis_hybrid.json',
    description: 'Hybrid Satellite style from ESRI',
  },
  {
    id: 'osm',
    name: 'OSM',
    image:
      'https://raw.githubusercontent.com/muimsd/map-gl-style-switcher/refs/heads/main/public/osm.png',
    styleUrl:
      'https://raw.githubusercontent.com/go2garret/maps/main/src/assets/json/openStreetMap.json',
    description: 'OSM style',
  },
];

export default function App() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  
  // Theme detection hook
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
    if (!mapContainer.current) {
      console.error('Map container not found!');
      return;
    }
    const currentStyle = mapStyles[0];
    const map = new maplibregl.Map({
      container: mapContainer.current,
      // Use a simple, reliable style first
      style: currentStyle.styleUrl,
      // Center on Dubai, UAE
      center: [55.2708, 25.2048],
      zoom: 10,
      attributionControl: false,
    });
    // Add navigation control (zoom/rotation)
    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    // Add compact attribution control
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
        console.log('Changing style from', from.name, 'to', to.name);
      },
      onAfterStyleChange: (_from, to) => {
        map.setStyle(to.styleUrl);
        console.log('Style changed to', to.name);
      },
    });
    map.addControl(styleSwitcher, 'bottom-left');

    return () => {
      map.remove();
    };
  }, []); // Empty dependency array

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
