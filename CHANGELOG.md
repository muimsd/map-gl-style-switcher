# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

The control was rewritten. Exports, option names and default class names are unchanged. The DOM structure and some behaviour changed, as listed below.

### Performance

- Bundled thumbnails reduced from 12.49 MB to 31 KB in total: 3200×1780 screenshots became 96×96 PNGs (5–8 KB each) under the same URLs.
- The DOM is built once instead of on every hover, so thumbnails are never re-created. List thumbnails load on first open, and re-renders with identical `styles` or `classNames` do nothing.

### Changed

- **DOM and ARIA:** now a WAI-ARIA select-only combobox. `role="combobox"`, `tabindex` and `aria-expanded` moved from the container to a trigger element, and `role="listbox"` moved to the list. The list stays in the DOM (`hidden`) while collapsed, and the collapsed item is no longer `role="option"`. Code that queries these attributes needs updating.
- Focusing the control with the keyboard no longer opens it; press `Enter`, `Space` or an arrow key. Selecting with the keyboard now closes the list.
- `updateOptions({ classNames })` replaces the previous custom class names instead of merging with them.
- `updateOptions` now warns and keeps the previous values if both `showLabels` and `showImages` would end up `false`.
- `useStyleSwitcher` updates the existing control when options change instead of recreating it, and returns the control once it has been added.
- CSS: colours are now `--style-switcher-*` custom properties, the keyframes are renamed to `style-switcher-fade-in`, and hovering no longer shifts items by 1px.

### Added

- Touch support: tap the trigger to toggle, tap outside to close; the list closes after a selection.
- `Home` and `End` keys, and a new `itemActive` class name (default `active`) for the keyboard-highlighted option.
- `prefers-reduced-motion` support.

### Fixed

- Keyboard navigation in real browsers: moving to an option blurred the container, which collapsed and destroyed the list.
- Options set to `undefined` overwrote defaults. This affected every `MapGLStyleSwitcher` that did not set `maxHeight` or `animationDuration`, which lost both (`"undefinedpx"`).
- `useStyleSwitcher` called stale callbacks, because callbacks were left out of its change detection.
- `MapGLStyleSwitcher` and `useStyleSwitcher` re-sent an unchanged `activeStyleId` on every other prop change, undoing the style the user had picked.
- `MapGLStyleSwitcher` updated an orphan control under React 19 StrictMode, so prop changes never reached the map.
- `updateOptions({ theme: 'auto' })` after mount did not follow OS theme changes.
- `updateOptions({ classNames: { container } })` was ignored, and class names containing spaces threw.
- Items shifted by 1px when selected, because of mismatched border widths.
- README hook example never added the control, because it passed `ref.current`.
- `activeStyleId` validation: invalid ids in the constructor and `updateOptions` now actually fall back to the first style as the warning message claims; previously the invalid id was silently retained, causing `onBeforeStyleChange` / `onAfterStyleChange` to be invoked with `from === undefined`.
- `_handleStyleChange` no longer relies on a non-null assertion (`!`) for the previous style; the lookup is now defensive and consistent with the new invariants.
- `updateOptions` now syncs the `dir` attribute on the container when the `rtl` option toggles (previously only set during `onAdd`).
- `updateOptions({ styles })` falls back to the first style when the previous active id is no longer present, so subsequent change events have a valid `from` reference.
- `outlined` design variant: restored a translucent backdrop (`backdrop-filter: blur(6px)`) for both light and dark themes — the fully transparent container left labels unreadable over many map styles.

### Changed

- CI matrix dropped Node 18.x; `@rollup/plugin-terser@1.0.0` requires Node ≥ 20.

## [0.10.0] - 2026-02-20

### Added

- Keyboard navigation support (Arrow Up/Down, Enter, Space, Escape)
- `role="listbox"` and `tabIndex` on style items for improved accessibility
- `animationDuration` and `maxHeight` options now applied to the DOM
- Exported `MapGLStyleSwitcherProps` type from `react-map-gl` entry
- Exported `UseStyleSwitcherOptions` type from `react` entry
- `outlined` design variant via the new `design` option (`'default' | 'outlined'`)
- `outlined` slot in `StyleSwitcherClassNames` for customizing the outlined-design class
- `lint-staged` for faster pre-commit hooks (replaces full `npm run validate`)
- UMD bundle minification via `@rollup/plugin-terser`
- This CHANGELOG file

### Fixed

- CI workflow now triggers on the correct `dev` branch instead of `develop`
- Added `.js` extension to import in `src/index.ts` for ESM compatibility

### Removed

- Empty vestigial `src/test-setup.ts` file (actual setup is `src/tests/test-setup.ts`)
- Hardcoded `max-height` and `animation-duration` from CSS (now set via JS from options)

## [0.9.3] - 2025-05-01

### Fixed

- Multiple bug fixes and correctness improvements across the library
- Updated map-gl-style-switcher dependency in examples

### Changed

- Added husky pre-commit hook with prettier formatting
- Updated dependencies for jest and typescript packages

## [0.9.2] - 2025-04-15

### Fixed

- Updated UMD output name to lowercase for consistency
- Removed unused type definitions and rollup plugin

## [0.9.1] - 2025-04-01

### Added

- Dark mode support with automatic theme detection (`theme: 'auto'`)
- Validation for `showLabels` and `showImages` options

### Fixed

- Updated image URLs in README
- Improved test structure for MapGLStyleSwitcher

## [0.9.0] - 2025-03-15

### Added

- Initial release
- `StyleSwitcherControl` - IControl implementation for Mapbox/MapLibre GL
- `MapGLStyleSwitcher` - React component for react-map-gl integration
- `useStyleSwitcher` - React hook for custom map instances
- Light, dark, and auto theme support
- RTL layout support
- `updateOptions()` imperative API
- Customizable CSS classes
- TypeScript support
- Accessibility features (ARIA labels)

[Unreleased]: https://github.com/muimsd/map-gl-style-switcher/compare/v0.10.0...HEAD
[0.10.0]: https://github.com/muimsd/map-gl-style-switcher/compare/v0.9.3...v0.10.0
[0.9.3]: https://github.com/muimsd/map-gl-style-switcher/compare/v0.9.2...v0.9.3
[0.9.2]: https://github.com/muimsd/map-gl-style-switcher/compare/v0.9.1...v0.9.2
[0.9.1]: https://github.com/muimsd/map-gl-style-switcher/compare/v0.9.0...v0.9.1
[0.9.0]: https://github.com/muimsd/map-gl-style-switcher/releases/tag/v0.9.0
