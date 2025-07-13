import React, { useEffect, useState } from 'react';
import { Map } from 'react-map-gl/maplibre';
import { MapGLStyleSwitcher, type StyleItem } from 'map-gl-style-switcher/react-map-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import 'map-gl-style-switcher/dist/map-gl-style-switcher.css';

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
  const [mapStyle, setMapStyle] = useState(mapStyles[0].styleUrl);
  const [activeStyleId, setActiveStyleId] = useState(mapStyles[0].id);
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
        style={{ width: '100%', height: 'calc(100vh - 200px)', borderRadius: '8px' }}
        mapStyle={mapStyle}
        onLoad={() => {
          console.log('Map loaded successfully');
        }}
        onError={evt => {
          console.error('Map error:', evt.error);
        }}
      >
        <MapGLStyleSwitcher
          styles={mapStyles}
          activeStyleId={activeStyleId}
          theme="auto"
          showLabels={true}
          showImages={true}
          position="bottom-left"
          onBeforeStyleChange={(from: StyleItem, to: StyleItem) => {
            console.log(`Switching from ${from.name} to ${to.name}`);
          }}
          onStyleChange={handleStyleChange}
        />
      </Map>
    </div>
  );
}
