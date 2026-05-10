# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

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
