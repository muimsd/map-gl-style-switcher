import React from 'react';
import { useControl } from 'react-map-gl/maplibre';
import { StyleSwitcherControl } from './StyleSwitcherControl';
import type { StyleItem } from './StyleSwitcherControl';

interface MapGLStyleSwitcherProps {
  /** Array of map styles to choose from */
  styles: StyleItem[];
  /** Currently active style ID */
  activeStyleId?: string;
  /** Theme of the control */
  theme?: 'light' | 'dark' | 'auto';
  /** Whether to show style labels */
  showLabels?: boolean;
  /** Whether to show style images */
  showImages?: boolean;
  /** Position of the control on the map */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Animation duration in milliseconds */
  animationDuration?: number;
  /** Maximum height of the control */
  maxHeight?: number;
  /** Right-to-left layout */
  rtl?: boolean;
  /** Custom CSS class names */
  classNames?: Partial<{
    container: string;
    list: string;
    item: string;
    itemSelected: string;
    itemHideLabel: string;
    dark: string;
    light: string;
  }>;
  /** Callback when style is about to change */
  onBeforeStyleChange?: (from: StyleItem, to: StyleItem) => void;
  /** Callback when style has changed */
  onAfterStyleChange?: (from: StyleItem, to: StyleItem) => void;
  /** Simplified callback that just returns the new style URL */
  onStyleChange?: (styleUrl: string) => void;
}

/**
 * React component for adding a style switcher control to react-map-gl Map
 *
 * @example
 * ```tsx
 * import { MapGLStyleSwitcher } from 'map-gl-style-switcher';
 * import { Map } from 'react-map-gl/maplibre';
 * import 'map-gl-style-switcher/dist/map-gl-style-switcher.css';
 *
 * function MyMap() {
 *   const [mapStyle, setMapStyle] = useState('style-url');
 *
 *   return (
 *     <Map mapStyle={mapStyle} ...otherProps>
 *       <MapGLStyleSwitcher
 *         styles={styles}
 *         activeStyleId="voyager"
 *         onStyleChange={setMapStyle}
 *         position="bottom-left"
 *       />
 *     </Map>
 *   );
 * }
 * ```
 */
export const MapGLStyleSwitcher: React.FC<MapGLStyleSwitcherProps> = ({
  styles,
  activeStyleId,
  theme = 'light',
  showLabels = true,
  showImages = true,
  position = 'bottom-left',
  animationDuration,
  maxHeight,
  rtl,
  classNames,
  onBeforeStyleChange,
  onAfterStyleChange,
  onStyleChange,
}) => {
  useControl(
    () =>
      new StyleSwitcherControl({
        styles,
        activeStyleId,
        theme,
        showLabels,
        showImages,
        animationDuration,
        maxHeight,
        rtl,
        classNames,
        onBeforeStyleChange,
        onAfterStyleChange: (from, to) => {
          // Call the provided onAfterStyleChange callback first
          onAfterStyleChange?.(from, to);
          // Then call the simplified onStyleChange callback
          onStyleChange?.(to.styleUrl);
        },
      }),
    {
      position,
    }
  );

  // This component doesn't render anything visible itself
  return null;
};

export default MapGLStyleSwitcher;
