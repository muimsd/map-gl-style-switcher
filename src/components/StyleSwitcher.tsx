import React, { useRef } from 'react';
import { StyleSwitcherControl } from './StyleSwitcherControl';
import type { StyleItem } from './StyleSwitcherControl';

// Conditional import to avoid build errors when react-map-gl is not available
let useControl: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const reactMapGL = require('react-map-gl');
  useControl = reactMapGL.useControl;
} catch {
  // Fallback if react-map-gl is not installed
  useControl = null;
}

interface StyleSwitcherProps {
  styles: StyleItem[];
  activeStyleId?: string;
  theme?: 'light' | 'dark' | 'auto';
  showLabels?: boolean;
  showImages?: boolean;
  onStyleChange?: (styleUrl: string) => void;
  onBeforeStyleChange?: (from: StyleItem, to: StyleItem) => void;
  onAfterStyleChange?: (from: StyleItem, to: StyleItem) => void;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  animationDuration?: number;
  maxHeight?: number;
  rtl?: boolean;
  classNames?: Partial<{
    container: string;
    list: string;
    item: string;
    itemSelected: string;
    itemHideLabel: string;
    dark: string;
    light: string;
  }>;
}

/**
 * React component wrapper for StyleSwitcherControl to be used with react-map-gl
 * 
 * @example
 * ```tsx
 * import { StyleSwitcher } from 'map-gl-style-switcher';
 * import 'map-gl-style-switcher/dist/map-gl-style-switcher.css';
 * 
 * <Map mapStyle={mapStyle}>
 *   <StyleSwitcher
 *     styles={styles}
 *     activeStyleId="voyager"
 *     theme="auto"
 *     onStyleChange={setMapStyle}
 *     position="bottom-left"
 *   />
 * </Map>
 * ```
 */
export const StyleSwitcher: React.FC<StyleSwitcherProps> = ({
  styles,
  activeStyleId,
  theme = 'light',
  showLabels = true,
  showImages = true,
  onStyleChange,
  onBeforeStyleChange,
  onAfterStyleChange,
  position = 'bottom-left',
  animationDuration,
  maxHeight,
  rtl,
  classNames,
}) => {
  const controlRef = useRef<StyleSwitcherControl | null>(null);

  if (!useControl) {
    console.error(
      'StyleSwitcher component requires react-map-gl to be installed. Please install it with: npm install react-map-gl'
    );
    return null;
  }

  useControl(() => {
    const control = new StyleSwitcherControl({
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
    });
    
    controlRef.current = control;
    return control;
  }, {
    position,
  });

  return null;
};

export default StyleSwitcher;
