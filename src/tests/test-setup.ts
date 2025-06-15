// Jest setup for DOM testing

// Mock MapLibre GL and Mapbox GL
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).maplibregl = {
  IControl: class {
    onAdd() {
      return document.createElement('div');
    }
    onRemove() {}
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).mapboxgl = {
  IControl: class {
    onAdd() {
      return document.createElement('div');
    }
    onRemove() {}
  },
};

// Mock CSS imports and matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
