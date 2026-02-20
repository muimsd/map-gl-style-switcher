import { useEffect, useRef } from 'react';
import { StyleSwitcherControl } from './StyleSwitcherControl';
import type { StyleSwitcherControlOptions } from './StyleSwitcherControl';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MapInstance = any; // MapLibre GL or Mapbox GL Map instance

export interface UseStyleSwitcherOptions extends StyleSwitcherControlOptions {
  /** Position of the control on the map */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

/**
 * React hook for using StyleSwitcherControl with any map instance
 *
 * @example
 * ```tsx
 * import { useEffect, useRef } from 'react';
 * import { useStyleSwitcher } from 'map-gl-style-switcher/react';
 * import maplibregl from 'maplibre-gl';
 *
 * function MyMapComponent() {
 *   const mapContainer = useRef<HTMLDivElement>(null);
 *   const map = useRef<maplibregl.Map | null>(null);
 *
 *   const styles = [
 *     { id: 'streets', name: 'Streets', styleUrl: 'mapbox://styles/mapbox/streets-v11' },
 *     { id: 'satellite', name: 'Satellite', styleUrl: 'mapbox://styles/mapbox/satellite-v9' }
 *   ];
 *
 *   useEffect(() => {
 *     if (!mapContainer.current) return;
 *
 *     map.current = new maplibregl.Map({
 *       container: mapContainer.current,
 *       style: styles[0].styleUrl,
 *       center: [0, 0],
 *       zoom: 2
 *     });
 *
 *     return () => map.current?.remove();
 *   }, []);
 *
 *   useStyleSwitcher(map.current, {
 *     styles,
 *     theme: 'auto',
 *     position: 'top-right'
 *   });
 *
 *   return <div ref={mapContainer} style={{ width: '100%', height: '400px' }} />;
 * }
 * ```
 */
export function useStyleSwitcher(
  map: MapInstance | null,
  options: UseStyleSwitcherOptions
) {
  const controlRef = useRef<StyleSwitcherControl | null>(null);
  const { position, ...controlOptions } = options;

  // JSON-serialised string is stable across renders when content is unchanged,
  // giving the effect a reliable deep-equality check without useMemo overhead
  // (controlOptions is a new object reference every render regardless).
  const optionsKey = JSON.stringify(controlOptions);

  useEffect(() => {
    if (!map) return;

    // Create and add the control
    controlRef.current = new StyleSwitcherControl(controlOptions);
    map.addControl(controlRef.current, position || 'top-right');

    return () => {
      if (controlRef.current && map) {
        map.removeControl(controlRef.current);
        controlRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, position, optionsKey]);

  return controlRef.current;
}
