export interface IControl {
  onAdd(map: unknown): HTMLElement;
  onRemove(map: unknown): void;
}

export interface StyleItem {
  id: string;
  name: string;
  /** Thumbnail URL or data URI. Displayed at 32×32 CSS px, so 96×96 is plenty. */
  image: string;
  styleUrl: string;
  description?: string;
}

export interface StyleSwitcherControlOptions {
  styles: StyleItem[];
  /** Currently active style ID (defaults to the first style) */
  activeStyleId?: string;
  onBeforeStyleChange?: (from: StyleItem, to: StyleItem) => void;
  onAfterStyleChange?: (from: StyleItem, to: StyleItem) => void;
  showLabels?: boolean;
  showImages?: boolean;
  animationDuration?: number;
  maxHeight?: number;
  theme?: 'light' | 'dark' | 'auto';
  design?: 'default' | 'outlined';
  classNames?: Partial<StyleSwitcherClassNames>;
  /** Enable RTL (Right-to-Left) layout */
  rtl?: boolean;
}

export interface StyleSwitcherClassNames {
  container: string;
  list: string;
  item: string;
  itemSelected: string;
  /** Applied to the option highlighted by keyboard navigation */
  itemActive: string;
  itemHideLabel: string;
  dark: string;
  light: string;
  outlined: string;
}

const DEFAULT_CLASS_NAMES: StyleSwitcherClassNames = {
  container:
    'maplibregl-ctrl maplibregl-ctrl-group mapboxgl-ctrl mapboxgl-ctrl-group style-switcher',
  list: 'style-switcher-list',
  item: 'style-switcher-item',
  itemSelected: 'selected',
  itemActive: 'active',
  itemHideLabel: 'hide-label',
  dark: 'style-switcher-dark',
  light: 'style-switcher-light',
  outlined: 'style-switcher-outlined',
};

const ARIA_LABEL = 'Style switcher';

/** Passing `undefined` for an option restores its default. */
function resolveOptions(options: StyleSwitcherControlOptions) {
  const resolved = {
    ...options,
    showLabels: options.showLabels ?? true,
    showImages: options.showImages ?? true,
    animationDuration: options.animationDuration ?? 200,
    maxHeight: options.maxHeight ?? 300,
    theme: options.theme ?? 'light',
    design: options.design ?? 'default',
    rtl: options.rtl ?? false,
  };
  if (!resolved.showLabels && !resolved.showImages) {
    throw new Error('At least one of showLabels or showImages must be true.');
  }
  return resolved;
}

function joinClasses(...classes: (string | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

let instanceCount = 0;

/**
 * Select-only combobox (WAI-ARIA APG pattern). DOM focus stays on the trigger
 * and the highlighted option is exposed through aria-activedescendant, so
 * moving through the list never blurs the control.
 *
 * The DOM is built once and only rebuilt when the rendered content changes.
 * Opening just unhides the list, so `loading="lazy"` defers its thumbnails
 * until the first open and they are never re-created afterwards.
 */
export class StyleSwitcherControl implements IControl {
  private _options: ReturnType<typeof resolveOptions>;
  private _activeStyleId: string | undefined;
  private _expanded = false;
  private _highlightedIndex = -1;
  /** Pointer type of the press that precedes a click ('' for keyboard/AT). */
  private _pressPointerType = '';
  private _contentKey: string | null = null;
  private readonly _idPrefix = `style-switcher-${++instanceCount}`;

  private _container: HTMLElement | null = null;
  private _list: HTMLElement | null = null;
  private _trigger: HTMLElement | null = null;
  private _items: HTMLElement[] = [];
  private _darkModeQuery: MediaQueryList | null = null;

  constructor(options: StyleSwitcherControlOptions) {
    this._options = resolveOptions(options);
    this._reconcileActiveStyleId(options.activeStyleId, true);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onAdd(_map?: unknown): HTMLElement {
    const container = document.createElement('div');

    const list = document.createElement('div');
    list.id = `${this._idPrefix}-list`;
    this._setListVisible(list, false);
    list.setAttribute('role', 'listbox');
    list.setAttribute('aria-label', ARIA_LABEL);

    const trigger = document.createElement('div');
    trigger.tabIndex = 0;
    trigger.setAttribute('role', 'combobox');
    trigger.setAttribute('aria-label', ARIA_LABEL);
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-controls', list.id);
    trigger.setAttribute('aria-expanded', 'false');

    container.addEventListener('pointerenter', this._onPointerHover);
    container.addEventListener('pointerleave', this._onPointerHover);
    container.addEventListener('pointerdown', this._onPointerDown);
    container.addEventListener('mousedown', this._onMouseDown);
    container.addEventListener('click', this._onClick);
    trigger.addEventListener('keydown', this._onKeyDown);
    trigger.addEventListener('blur', () => this._setExpanded(false));

    this._container = container;
    this._list = list;
    this._trigger = trigger;
    this._sync();
    return container;
  }

  onRemove(): void {
    document.removeEventListener(
      'pointerdown',
      this._onDocumentPointerDown,
      true
    );
    this._subscribeToDarkMode(false);
    this._container?.remove();
    this._container = this._list = this._trigger = null;
    this._items = [];
    this._contentKey = null;
    this._expanded = false;
    this._highlightedIndex = -1;
  }

  /**
   * Update options at any time. Omitted keys are unchanged; a key explicitly
   * set to `undefined` is restored to its default (except `styles` and
   * `activeStyleId`, which keep their current value).
   */
  updateOptions(updates: Partial<StyleSwitcherControlOptions>): void {
    const styles = updates.styles ?? this._options.styles;
    const stylesChanged = styles !== this._options.styles;
    const next = { ...this._options, ...updates, styles };
    if (next.showLabels === false && next.showImages === false) {
      // Unlike the constructor this does not throw: it may run inside a React
      // effect, and two separate updates can pass through this state.
      console.warn(
        'StyleSwitcherControl: at least one of showLabels or showImages must be true. Keeping their previous values.'
      );
      next.showLabels = this._options.showLabels;
      next.showImages = this._options.showImages;
    }
    this._options = resolveOptions(next);
    this._reconcileActiveStyleId(updates.activeStyleId, stylesChanged);
    this._sync();
  }

  /** Keeps _activeStyleId pointing at a style in the current list. */
  private _reconcileActiveStyleId(
    requestedId: string | undefined,
    stylesChanged: boolean
  ): void {
    const { styles } = this._options;
    const exists = (id: string | undefined) => styles.some(s => s.id === id);

    if (requestedId !== undefined && exists(requestedId)) {
      this._activeStyleId = requestedId;
      return;
    }
    if (requestedId !== undefined) {
      console.warn(
        `StyleSwitcherControl: activeStyleId "${requestedId}" does not match any style. ${
          stylesChanged
            ? 'Using first style instead.'
            : 'Keeping previous selection.'
        }`
      );
      if (stylesChanged) this._activeStyleId = undefined;
    }
    if (!exists(this._activeStyleId)) {
      this._activeStyleId = styles[0]?.id;
    }
  }

  private _sync(): void {
    if (!this._container || !this._list) return;
    this._subscribeToDarkMode(this._options.theme === 'auto');
    this._syncContainer();

    const { styles, showLabels, showImages, classNames } = this._options;
    const contentKey = JSON.stringify([
      styles,
      showLabels,
      showImages,
      classNames,
    ]);
    if (contentKey !== this._contentKey) {
      this._contentKey = contentKey;
      this._rebuildContent();
    }

    this._list.style.maxHeight = `${this._options.maxHeight}px`;
    this._list.style.animationDuration = `${this._options.animationDuration}ms`;
    this._syncSelection();
  }

  private _subscribeToDarkMode(subscribe: boolean): void {
    if (subscribe && !this._darkModeQuery) {
      this._darkModeQuery =
        window.matchMedia?.('(prefers-color-scheme: dark)') ?? null;
      this._darkModeQuery?.addEventListener('change', this._syncContainer);
    } else if (!subscribe && this._darkModeQuery) {
      this._darkModeQuery.removeEventListener('change', this._syncContainer);
      this._darkModeQuery = null;
    }
  }

  private _syncContainer = (): void => {
    if (!this._container) return;
    const { theme, design, rtl } = this._options;
    const classNames = this._classNames;
    const isDark =
      theme === 'dark' || (theme === 'auto' && !!this._darkModeQuery?.matches);

    this._container.className = joinClasses(
      classNames.container,
      isDark ? classNames.dark : classNames.light,
      design === 'outlined' && classNames.outlined
    );
    if (rtl) {
      this._container.setAttribute('dir', 'rtl');
    } else {
      this._container.removeAttribute('dir');
    }
  };

  private _rebuildContent(): void {
    if (!this._container || !this._list || !this._trigger) return;
    const { styles } = this._options;

    this._list.className = this._classNames.list;
    this._items = styles.map((style, index) => {
      const item = document.createElement('div');
      item.id = `${this._idPrefix}-option-${index}`;
      item.setAttribute('role', 'option');
      item.title = style.description || style.name;
      this._appendItemContent(item, style, 'lazy');
      return item;
    });
    this._list.replaceChildren(...this._items);

    // Force the trigger's content to be redrawn by _syncSelection.
    this._trigger.replaceChildren();
    delete this._trigger.dataset.styleId;

    if (styles.length) {
      // Re-parenting a connected trigger would drop its keyboard focus.
      if (this._trigger.parentNode !== this._container) {
        this._container.replaceChildren(this._list, this._trigger);
      }
    } else {
      this._setExpanded(false);
      this._container.replaceChildren();
    }
    if (this._highlightedIndex >= 0) {
      this._highlightedIndex = this._selectedIndex;
    }
  }

  private _appendItemContent(
    parent: HTMLElement,
    style: StyleItem,
    loading: 'lazy' | 'eager'
  ): void {
    const { showImages, showLabels } = this._options;
    if (showImages) {
      const img = document.createElement('img');
      // Set before src, so the browser cannot start an eager fetch.
      img.setAttribute('loading', loading);
      img.setAttribute('decoding', 'async');
      img.width = 32;
      img.height = 32;
      // Decorative next to a visible label, otherwise it names the item.
      img.alt = showLabels ? '' : style.name;
      img.src = style.image;
      parent.appendChild(img);
    }
    if (showLabels) {
      const span = document.createElement('span');
      span.textContent = style.name;
      parent.appendChild(span);
    }
  }

  /** Updates only what depends on the selected or highlighted item. */
  private _syncSelection(): void {
    const { styles } = this._options;
    const selectedIndex = this._selectedIndex;
    const classNames = this._classNames;
    const hideLabel = !this._options.showLabels && classNames.itemHideLabel;

    this._items.forEach((item, index) => {
      item.className = joinClasses(
        classNames.item,
        index === selectedIndex && classNames.itemSelected,
        index === this._highlightedIndex && classNames.itemActive,
        hideLabel
      );
      item.setAttribute('aria-selected', String(index === selectedIndex));
    });

    const trigger = this._trigger;
    const selected = styles[selectedIndex];
    if (!trigger || !selected) return;

    trigger.className = joinClasses(
      classNames.item,
      classNames.itemSelected,
      hideLabel
    );
    trigger.title = selected.description || selected.name;
    if (trigger.dataset.styleId !== selected.id) {
      trigger.dataset.styleId = selected.id;
      trigger.replaceChildren();
      this._appendItemContent(trigger, selected, 'eager');
    }
    if (this._highlightedIndex >= 0) {
      trigger.setAttribute(
        'aria-activedescendant',
        this._items[this._highlightedIndex].id
      );
    } else {
      trigger.removeAttribute('aria-activedescendant');
    }
  }

  private _setExpanded(expanded: boolean): void {
    if (!this._options.styles.length) expanded = false;
    if (this._expanded === expanded) return;
    this._expanded = expanded;
    this._highlightedIndex = -1;
    if (!this._list || !this._trigger) return;
    this._setListVisible(this._list, expanded);
    this._trigger.setAttribute('aria-expanded', String(expanded));
    if (expanded) {
      // Capture phase: the map may stop propagation of events on its canvas.
      document.addEventListener(
        'pointerdown',
        this._onDocumentPointerDown,
        true
      );
    } else {
      document.removeEventListener(
        'pointerdown',
        this._onDocumentPointerDown,
        true
      );
    }
    this._syncSelection();
  }

  // The inline style also covers custom list classes that set `display`, which
  // would otherwise override the `hidden` attribute.
  private _setListVisible(list: HTMLElement, visible: boolean): void {
    list.hidden = !visible;
    list.style.display = visible ? '' : 'none';
  }

  private _highlight(index: number): void {
    const last = this._options.styles.length - 1;
    this._highlightedIndex = Math.max(0, Math.min(index, last));
    this._syncSelection();
    this._items[this._highlightedIndex].scrollIntoView?.({ block: 'nearest' });
  }

  private _select(style: StyleItem): void {
    const from = this._options.styles[this._selectedIndex];
    if (!from || style.id === from.id) return;
    this._options.onBeforeStyleChange?.(from, style);
    this._activeStyleId = style.id;
    this._syncSelection();
    this._options.onAfterStyleChange?.(from, style);
  }

  private get _selectedIndex(): number {
    return this._options.styles.findIndex(s => s.id === this._activeStyleId);
  }

  /** Where arrow keys move from: pointer-opened lists have no highlight yet. */
  private get _keyboardIndex(): number {
    return this._highlightedIndex >= 0
      ? this._highlightedIndex
      : this._selectedIndex;
  }

  private get _classNames(): StyleSwitcherClassNames {
    return { ...DEFAULT_CLASS_NAMES, ...this._options.classNames };
  }

  // Hover only applies to a real mouse: touch input opens and closes by tap.
  private _onPointerHover = (e: PointerEvent): void => {
    if (e.pointerType === 'mouse') {
      this._setExpanded(e.type === 'pointerenter');
    }
  };

  private _onPointerDown = (e: PointerEvent): void => {
    this._pressPointerType = e.pointerType;
  };

  // A press on the trigger focuses it natively, so keys work after a click
  // without showing the focus ring that a scripted focus() would. A press
  // anywhere else must not blur it, or the list would close before `click`.
  private _onMouseDown = (e: MouseEvent): void => {
    if (!this._trigger?.contains(e.target as Node)) e.preventDefault();
  };

  // composedPath, because e.target is retargeted at a shadow root boundary.
  private _onDocumentPointerDown = (e: Event): void => {
    if (!this._container || !e.composedPath().includes(this._container)) {
      this._setExpanded(false);
    }
  };

  private _onClick = (e: MouseEvent): void => {
    const viaMouse = this._pressPointerType === 'mouse';
    this._pressPointerType = '';
    const target = e.target as Node;

    if (this._trigger?.contains(target)) {
      // A hovering mouse has already opened the list, so never toggle it shut.
      this._setExpanded(viaMouse || !this._expanded);
      return;
    }
    const index = this._items.findIndex(item => item.contains(target));
    if (index >= 0) {
      this._select(this._options.styles[index]);
      // A mouse closes the list by leaving it; there is no hover on touch.
      if (!viaMouse) this._setExpanded(false);
    }
  };

  private _onKeyDown = (e: KeyboardEvent): void => {
    const handled = this._expanded
      ? this._handleExpandedKey(e.key)
      : this._handleCollapsedKey(e.key);
    if (handled) e.preventDefault();
  };

  private _handleCollapsedKey(key: string): boolean {
    if (!['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(key)) return false;
    this._setExpanded(true);
    this._highlight(this._selectedIndex);
    return true;
  }

  private _handleExpandedKey(key: string): boolean {
    switch (key) {
      case 'ArrowDown':
        this._highlight(this._keyboardIndex + 1);
        return true;
      case 'ArrowUp':
        this._highlight(this._keyboardIndex - 1);
        return true;
      case 'Home':
        this._highlight(0);
        return true;
      case 'End':
        this._highlight(this._options.styles.length - 1);
        return true;
      case 'Enter':
      case ' ':
        if (this._highlightedIndex >= 0) {
          this._select(this._options.styles[this._highlightedIndex]);
        }
        this._setExpanded(false);
        return true;
      case 'Escape':
        this._setExpanded(false);
        return true;
      default:
        return false;
    }
  }
}
