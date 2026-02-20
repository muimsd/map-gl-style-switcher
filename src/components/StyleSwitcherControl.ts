// Polyfill types for IControl if not present
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MapInstance = any; // This represents either MapLibre GL Map or Mapbox GL Map

export interface IControl {
  onAdd(map: MapInstance): HTMLElement;
  onRemove(map: MapInstance): void;
}

export interface StyleItem {
  id: string;
  name: string;
  image: string;
  styleUrl: string;
  description?: string;
}

export interface StyleSwitcherControlOptions {
  styles: StyleItem[];
  activeStyleId?: string; // Currently active style ID (replaces initialStyleId and collapsedStyleId)
  onBeforeStyleChange?: (from: StyleItem, to: StyleItem) => void;
  onAfterStyleChange?: (from: StyleItem, to: StyleItem) => void;
  showLabels?: boolean;
  showImages?: boolean;
  animationDuration?: number;
  maxHeight?: number;
  theme?: 'light' | 'dark' | 'auto';
  classNames?: Partial<StyleSwitcherClassNames>;
  rtl?: boolean; // Enable RTL (Right-to-Left) layout
}

export interface StyleSwitcherClassNames {
  container: string;
  list: string;
  item: string;
  itemSelected: string;
  itemHideLabel: string;
  dark: string;
  light: string;
}

export class StyleSwitcherControl implements IControl {
  private _container: HTMLElement | null = null;
  private _options: StyleSwitcherControlOptions;
  private _activeStyleId: string;
  private _expanded: boolean = false;
  private _classNames: Required<StyleSwitcherClassNames>;
  private _mediaQuery: MediaQueryList | null = null;
  private _mediaQueryHandler: (() => void) | null = null;

  constructor(options: StyleSwitcherControlOptions) {
    // Ensure at least one of showLabels or showImages is true
    const showLabels = options.showLabels !== false;
    const showImages = options.showImages !== false;
    if (!showLabels && !showImages) {
      throw new Error('At least one of showLabels or showImages must be true.');
    }

    // Validate activeStyleId if provided
    if (
      options.activeStyleId &&
      !options.styles.find(s => s.id === options.activeStyleId)
    ) {
      console.warn(
        `StyleSwitcherControl: activeStyleId "${options.activeStyleId}" does not match any style. Using first style instead.`
      );
    }

    this._options = {
      showLabels,
      showImages,
      animationDuration: 200,
      maxHeight: 300,
      theme: 'light',
      ...options,
    };
    this._activeStyleId = options.activeStyleId || options.styles[0]?.id;
    this._classNames = {
      container:
        'maplibregl-ctrl maplibregl-ctrl-group mapboxgl-ctrl mapboxgl-ctrl-group style-switcher',
      list: 'style-switcher-list',
      item: 'style-switcher-item',
      itemSelected: 'selected',
      itemHideLabel: 'hide-label',
      dark: 'style-switcher-dark',
      light: 'style-switcher-light',
      ...options.classNames,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onAdd(_map: MapInstance): HTMLElement {
    this._container = document.createElement('div');
    this._container.className = this._classNames.container;
    this._container.tabIndex = 0;
    this._container.setAttribute('role', 'button');
    this._container.setAttribute('aria-label', 'Style switcher');
    this._container.setAttribute('aria-expanded', 'false');

    // Apply RTL if specified
    if (this._options.rtl) {
      this._container.setAttribute('dir', 'rtl');
    }

    // Theme support
    this._applyTheme();

    // Keep auto theme in sync with OS preference changes
    if (this._options.theme === 'auto' && window.matchMedia) {
      this._mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this._mediaQueryHandler = () => this._applyTheme();
      this._mediaQuery.addEventListener('change', this._mediaQueryHandler);
    }

    this._container.addEventListener('mouseenter', () =>
      this._setExpanded(true)
    );
    this._container.addEventListener('mouseleave', () =>
      this._setExpanded(false)
    );
    this._container.addEventListener('focus', () => this._setExpanded(true));
    this._container.addEventListener('blur', () => this._setExpanded(false));

    this._render();
    return this._container;
  }

  private _applyTheme() {
    if (!this._container) return;
    this._container.classList.remove(
      this._classNames.dark,
      this._classNames.light
    );
    if (this._options.theme === 'dark') {
      this._container.classList.add(this._classNames.dark);
    } else if (this._options.theme === 'light') {
      this._container.classList.add(this._classNames.light);
    } else if (this._options.theme === 'auto') {
      // Auto-detect dark mode
      const isDark =
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      this._container.classList.add(
        isDark ? this._classNames.dark : this._classNames.light
      );
    }
  }

  /**
   * Update control options after it has been added to the map.
   * Only the supplied keys are merged; omitted keys are unchanged.
   */
  updateOptions(updates: Partial<StyleSwitcherControlOptions>): void {
    if ('activeStyleId' in updates && updates.activeStyleId !== undefined) {
      this._activeStyleId = updates.activeStyleId;
    }
    if ('classNames' in updates) {
      this._classNames = { ...this._classNames, ...updates.classNames };
    }
    Object.assign(this._options, updates);
    if (this._container) {
      this._render();
    }
  }

  onRemove() {
    if (this._mediaQuery && this._mediaQueryHandler) {
      this._mediaQuery.removeEventListener('change', this._mediaQueryHandler);
      this._mediaQuery = null;
      this._mediaQueryHandler = null;
    }
    if (this._container && this._container.parentNode) {
      this._container.parentNode.removeChild(this._container);
    }
    this._container = null;
  }

  private _setExpanded(expanded: boolean) {
    if (this._expanded === expanded) return;
    this._expanded = expanded;
    this._container?.setAttribute('aria-expanded', expanded.toString());
    this._render();
    this._applyTheme();
  }

  private _handleStyleChange(style: StyleItem) {
    if (style.id === this._activeStyleId) return;
    const from = this._options.styles.find(s => s.id === this._activeStyleId)!;
    if (this._options.onBeforeStyleChange)
      this._options.onBeforeStyleChange(from, style);
    this._activeStyleId = style.id;
    this._render();
    if (this._options.onAfterStyleChange)
      this._options.onAfterStyleChange(from, style);
  }

  private _render() {
    if (!this._container) return;
    this._container.innerHTML = '';
    this._applyTheme();
    const currentStyle =
      this._options.styles.find(s => s.id === this._activeStyleId) ||
      this._options.styles[0];

    if (!currentStyle) return;

    // List (expanded)
    if (this._expanded) {
      const list = document.createElement('div');
      list.className = this._classNames.list;
      list.style.display = 'flex';

      for (const style of this._options.styles) {
        const item = this._createStyleItem(
          style,
          style.id === this._activeStyleId
        );
        item.onclick = () => this._handleStyleChange(style);
        list.appendChild(item);
      }
      this._container.appendChild(list);
    }

    // Single (collapsed) - Always show the active style
    const selected = this._createStyleItem(currentStyle, true);
    this._container.appendChild(selected);
  }

  private _createStyleItem(style: StyleItem, selected: boolean) {
    const div = document.createElement('div');
    let className = this._classNames.item;
    if (selected) className += ' ' + this._classNames.itemSelected;
    if (this._options.showLabels === false)
      className += ' ' + this._classNames.itemHideLabel;
    div.className = className;
    div.setAttribute('role', 'option');
    div.setAttribute('aria-selected', selected.toString());
    div.setAttribute('title', style.description || style.name);

    // Image
    if (this._options.showImages !== false) {
      const img = document.createElement('img');
      img.src = style.image;
      img.alt = style.name;
      img.loading = 'lazy';
      div.appendChild(img);
    }

    // Label
    if (this._options.showLabels !== false) {
      const span = document.createElement('span');
      span.textContent = style.name;
      div.appendChild(span);
    }
    return div;
  }
}
