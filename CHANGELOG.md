# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Keyboard navigation support (Arrow Up/Down, Enter, Space, Escape)
- `role="listbox"` and `tabIndex` on style items for improved accessibility
- `animationDuration` and `maxHeight` options now applied to the DOM
- Exported `MapGLStyleSwitcherProps` type from `react-map-gl` entry
- Exported `UseStyleSwitcherOptions` type from `react` entry
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

[Unreleased]: https://github.com/muimsd/map-gl-style-switcher/compare/v0.9.3...HEAD
[0.9.3]: https://github.com/muimsd/map-gl-style-switcher/compare/v0.9.2...v0.9.3
[0.9.2]: https://github.com/muimsd/map-gl-style-switcher/compare/v0.9.1...v0.9.2
[0.9.1]: https://github.com/muimsd/map-gl-style-switcher/compare/v0.9.0...v0.9.1
[0.9.0]: https://github.com/muimsd/map-gl-style-switcher/releases/tag/v0.9.0
