import { useEffect, useRef, useState } from 'react';
import { StyleSwitcherControl } from './StyleSwitcherControl';
import type { StyleSwitcherControlOptions } from './StyleSwitcherControl';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MapInstance = any; // MapLibre GL or Mapbox GL Map instance

export interface UseStyleSwitcherOptions extends StyleSwitcherControlOptions {
  /** Position of the control on the map */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

// A key dropped from the hook's options must fall back to its default, so
// every updatable option is sent explicitly on each update.
const RESET_OPTIONS: Partial<StyleSwitcherControlOptions> = {
  showLabels: undefined,
  showImages: undefined,
  animationDuration: undefined,
  maxHeight: undefined,
  theme: undefined,
  design: undefined,
  classNames: undefined,
  rtl: undefined,
};

/**
 * React hook for using StyleSwitcherControl with any map instance.
 *
 * The map must be passed as state (not `ref.current`) so that the hook
 * re-runs once the map exists. Option changes update the existing control, and
 * callbacks may change identity freely. Returns the control, or null until it
 * has been added.
 *
 * @example
 * ```tsx
 * import { useEffect, useRef, useState } from 'react';
 * import { useStyleSwitcher } from 'map-gl-style-switcher/react';
 * import maplibregl from 'maplibre-gl';
 *
 * function MyMapComponent() {
 *   const mapContainer = useRef<HTMLDivElement>(null);
 *   const [map, setMap] = useState<maplibregl.Map | null>(null);
 *
 *   useEffect(() => {
 *     if (!mapContainer.current) return;
 *     const instance = new maplibregl.Map({
 *       container: mapContainer.current,
 *       style: styles[0].styleUrl,
 *     });
 *     setMap(instance);
 *     return () => instance.remove();
 *   }, []);
 *
 *   useStyleSwitcher(map, {
 *     styles,
 *     theme: 'auto',
 *     position: 'top-right',
 *     onAfterStyleChange: (_from, to) => map?.setStyle(to.styleUrl),
 *   });
 *
 *   return <div ref={mapContainer} style={{ width: '100%', height: '400px' }} />;
 * }
 * ```
 */
export function useStyleSwitcher(
  map: MapInstance | null,
  options: UseStyleSwitcherOptions
): StyleSwitcherControl | null {
  const { position = 'top-right', ...controlOptions } = options;
  const [control, setControl] = useState<StyleSwitcherControl | null>(null);

  // The control reads the latest options through this ref, so a new callback
  // identity on each render neither recreates it nor leaves it calling a
  // stale closure.
  const latestOptions = useRef(controlOptions);
  latestOptions.current = controlOptions;

  // Functions serialise to nothing, so this only changes with the data options.
  const optionsKey = JSON.stringify(controlOptions);
  const appliedKey = useRef(optionsKey);
  const appliedActiveId = useRef(controlOptions.activeStyleId);

  useEffect(() => {
    if (!map) return;

    const instance = new StyleSwitcherControl({
      ...latestOptions.current,
      onBeforeStyleChange: (from, to) =>
        latestOptions.current.onBeforeStyleChange?.(from, to),
      onAfterStyleChange: (from, to) =>
        latestOptions.current.onAfterStyleChange?.(from, to),
    });
    appliedKey.current = optionsKey;
    appliedActiveId.current = latestOptions.current.activeStyleId;
    map.addControl(instance, position);
    setControl(instance);

    return () => {
      map.removeControl(instance);
      setControl(null);
    };
    // Option changes are applied by the effect below, without recreating.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, position]);

  useEffect(() => {
    if (!control || appliedKey.current === optionsKey) return;
    appliedKey.current = optionsKey;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { onBeforeStyleChange, onAfterStyleChange, activeStyleId, ...data } =
      latestOptions.current;
    // Only a changed id is sent: re-sending the old one would undo the style
    // the user has picked since.
    const idChanged = activeStyleId !== appliedActiveId.current;
    appliedActiveId.current = activeStyleId;
    control.updateOptions({
      ...RESET_OPTIONS,
      ...data,
      activeStyleId: idChanged ? activeStyleId : undefined,
    });
  }, [control, optionsKey]);

  return control;
}
