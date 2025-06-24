import React, { useState } from 'react';
import {Map} from 'react-map-gl/maplibre';
import { MapGLStyleSwitcher, type StyleItem } from 'map-gl-style-switcher';
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
    styleUrl: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
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
  }
];

export default function App() {
  const [mapStyle, setMapStyle] = useState(mapStyles[0].styleUrl);
  const [activeStyleId, setActiveStyleId] = useState(mapStyles[0].id);

  const handleStyleChange = (styleUrl: string) => {
    setMapStyle(styleUrl);
    const style = mapStyles.find(s => s.styleUrl === styleUrl);
    if (style) {
      setActiveStyleId(style.id);
      console.log(`Style changed to: ${style.name}`);
    }
  };

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f0f0f0',
      fontFamily: 'Arial, sans-serif'
    }}>
      <Map
        initialViewState={{
          longitude: -91.874,
          latitude: 42.76,
          zoom: 12
        }}
        style={{ width: '800px', height: '600px' }}
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
