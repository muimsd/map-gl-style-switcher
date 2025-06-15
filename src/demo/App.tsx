import { useEffect } from 'react';
import type { StyleItem } from '../components/StyleSwitcherControl.ts';
import { StyleSwitcherControl } from '../components/StyleSwitcherControl.ts';
import maplibregl from 'maplibre-gl';

// Register RTL text plugin for proper Arabic script rendering
maplibregl.setRTLTextPlugin(
  'https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.3.0/dist/mapbox-gl-rtl-text.js',
  false
);

const styles: StyleItem[] = [
  {
    id: 'voyager',
    name: 'Voyager',
    image: './voyager.png',
    styleUrl: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
    description: 'Voyager style from Carto',
  },
  {
    id: 'positron',
    name: 'Positron',
    image: './positron.png',
    styleUrl: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    description: 'Positron style from Carto',
  },
  {
    id: 'dark-matter',
    name: 'Dark Matter',
    image: './dark.png',
    styleUrl:
      'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    description: 'Dark style from Carto',
  },
  {
    id: 'arcgis-hybrid',
    name: 'ArcGIS Hybrid',
    image: './arcgis-hybrid.png',
    styleUrl:
      'https://raw.githubusercontent.com/go2garret/maps/main/src/assets/json/arcgis_hybrid.json',
    description: 'Hybrid Satellite style from ESRI',
  },
  {
    id: 'osm',
    name: 'OSM',
    image: './osm.png',
    styleUrl:
      'https://raw.githubusercontent.com/go2garret/maps/main/src/assets/json/openStreetMap.json',
    description: 'OSM style',
  },
];

export const App = () => {
  useEffect(() => {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      console.error('Map container not found!');
      return;
    }

    const map = new maplibregl.Map({
      container: 'map',
      // Use a simple, reliable style first
      style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
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
      styles: styles,
      theme: 'light',
      showLabels: true,
      showImages: false,
      activeStyleId: 'arcgis-hybrid',
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
    <div>
      <div
        id="map"
        style={{
          width: '100vw',
          height: '100vh',
        }}
      />
    </div>
  );
};
