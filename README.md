# Map GL Style Switcher

A TypeScript control for switching Mapbox GL / MapLibre GL map styles. Easily add a floating style switcher to your map app, with support for multiple styles, images, dark/light themes, and before/after change callbacks.

## Features

- IControl implementation for Mapbox GL / MapLibre GL
- Floating style switcher in any corner (via map.addControl position)
- Support for multiple map styles with thumbnails
- Expand/collapse on hover with smooth animations
- Dark/light/auto theme support
- RTL text support for Arabic scripts
- Configurable display options (show/hide labels and images)
- Callbacks for before/after style change
- Fully customizable CSS classes
- TypeScript support
- Accessibility features (ARIA labels, keyboard navigation)


## Install

```sh
# Using pnpm (recommended)
pnpm add map-gl-style-changer

# Using npm
npm install map-gl-style-changer --save

# Using yarn
yarn add map-gl-style-changer
```

## Usage

### Basic MapLibre GL Integration

```ts
import maplibregl from 'maplibre-gl';
import { StyleSwitcherControl } from 'map-gl-style-changer';
import 'map-gl-style-changer/dist/map-gl-style-changer.css';

// Create map
const map = new maplibregl.Map({
  container: 'map',
  style: 'https://demotiles.maplibre.org/style.json',
  center: [0, 0],
  zoom: 2
});

// Define styles
const styles = [
  {
    id: 'basic',
    name: 'Basic',
    image: 'path/to/thumbnail.png',
    styleUrl: 'https://demotiles.maplibre.org/style.json'
  },
  {
    id: 'satellite',
    name: 'Satellite',
    image: 'path/to/satellite-thumb.png', 
    styleUrl: 'https://your-satellite-style.json'
  }
  // ... more styles
];

// Add style switcher control
const styleSwitcher = new StyleSwitcherControl({
  styles: styles,
  theme: 'auto', // 'light', 'dark', or 'auto'
  showLabels: true,
  showImages: true,
  
  onBeforeStyleChange: (from, to) => {
    console.log(`Switching from ${from.name} to ${to.name}`);
  },
  onAfterStyleChange: (from, to) => {
    map.setStyle(to.styleUrl);
  }
});

map.addControl(styleSwitcher, 'bottom-left');
```

## Configuration Options

```ts
interface StyleSwitcherControlOptions {
  styles: StyleItem[];                    // Array of map styles (required)
  activeStyleId?: string;                 // Currently active style ID (default: first style)
  onBeforeStyleChange?: (from: StyleItem, to: StyleItem) => void; // Callback before style change
  onAfterStyleChange?: (from: StyleItem, to: StyleItem) => void;  // Callback after style change
  showLabels?: boolean;                   // Show style names (default: true)
  showImages?: boolean;                   // Show style thumbnails (default: true)
  animationDuration?: number;             // Animation duration in ms (default: 200)
  maxHeight?: number;                     // Max height of expanded list (default: 300)
  theme?: 'light' | 'dark' | 'auto';     // UI theme (default: 'light')
  classNames?: Partial<StyleSwitcherClassNames>; // Custom CSS classes
  rtl?: boolean;                          // Enable RTL layout (default: false)
}

interface StyleItem {
  id: string;          // Unique identifier
  name: string;        // Display name
  image: string;       // Thumbnail URL or data URI
  styleUrl: string;    // MapLibre/Mapbox style URL
  description?: string; // Optional tooltip text
}

interface StyleSwitcherClassNames {
  container: string;      // Main container class
  list: string;          // Expanded list container class
  item: string;          // Individual style item class
  itemSelected: string;  // Selected style item class
  itemHideLabel: string; // Hide label utility class
  dark: string;          // Dark theme class
  light: string;         // Light theme class
}
```

### Option Details

- **`activeStyleId`**: Controls both the initially selected style and what's displayed in the collapsed state
- **`showLabels`** & **`showImages`**: At least one must be `true`
- **`theme`**: 
  - `'light'`: Light color scheme
  - `'dark'`: Dark color scheme  
  - `'auto'`: Auto-detect from system preference
- **`rtl`**: Enables right-to-left layout for Arabic/Hebrew interfaces

## Customizing CSS Classes

You can override all CSS classes used by the style switcher control using the `classNames` option:

```ts
import { StyleSwitcherControl } from 'map-gl-style-changer';

const styleSwitcher = new StyleSwitcherControl({
  styles,
  showLabels: true,
  showImages: true,
  classNames: {
    container: 'my-style-switcher',
    list: 'my-style-list',
    item: 'my-style-item',
    itemSelected: 'my-style-item-selected',
    itemHideLabel: 'my-style-item-hide-label',
    dark: 'my-style-dark',
    light: 'my-style-light',
  }
});
```

See the default class names in the `StyleSwitcherControl` source for all available keys.

## File Structure

```
map-gl-style-switcher/
├── src/
│   ├── components/
│   │   └── StyleSwitcherControl.ts    # Main IControl implementation
│   ├── styles/
│   │   └── style-switcher.css         # Control styles (themes, RTL support)
│   ├── types/
│   │   ├── index.ts                   # TypeScript type definitions
│   │   └── css.d.ts                   # CSS module declarations
│   ├── tests/
│   │   ├── StyleSwitcherControl.test.ts # Test suite
│   │   └── test-setup.ts              # Jest test setup
│   ├── demo/
│   │   ├── main.tsx                   # Demo entry point
│   │   ├── App.tsx                    # Demo component
│   │   └── index.css                  # Demo-specific styles
│   └── index.ts                       # Package entry point
├── dist/                              # Built package output
│   ├── index.js                       # ES Module
│   ├── index.umd.js                   # UMD Module
│   ├── index.d.ts                     # TypeScript declarations
│   └── map-gl-style-changer.css       # Bundled CSS
├── package.json                       # Package configuration
├── rollup.config.js                   # Production build configuration
├── vite.config.ts                     # Development build configuration
├── jest.config.js                     # Test configuration
├── tsconfig.json                      # TypeScript configuration
└── README.md                          # Documentation
```

## Development

This project uses [pnpm](https://pnpm.io/) for dependency management, which provides better performance and disk space efficiency.

### Prerequisites

```sh
# Install pnpm globally if you haven't already
npm install -g pnpm
```

### Quick Start

```sh
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Lint and format code
pnpm lint
pnpm format

# Validate before publishing
pnpm validate
```

## Build for npm

The project uses Rollup for optimized production builds, generating:

- `dist/index.js` - ES module format
- `dist/index.umd.js` - UMD format for browser usage
- `dist/index.d.ts` - TypeScript declarations
- `dist/map-gl-style-changer.css` - Minified CSS styles

```sh
# Standard build
pnpm build

# Production build with full validation
pnpm build:prod
```

## Contributing

We welcome contributions! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup

1. **Clone the repository**
   ```sh
   git clone https://github.com/muimsd/map-gl-style-changer
   cd map-gl-style-changer
   ```

2. **Install dependencies**
   ```sh
   pnpm install
   ```

3. **Start development server**
   ```sh
   pnpm dev
   ```

4. **Make your changes**
   - Follow TypeScript best practices
   - Maintain backward compatibility when possible
   - Add tests for new features

5. **Test your changes**
   ```sh
   pnpm validate  # Runs type-check, lint, format-check, and tests
   ```

6. **Submit a pull request**

### Available Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build library with Rollup (ES modules, UMD, TypeScript declarations, and CSS)
- `pnpm build:prod` - Production build with validation (type-check, lint, and build)
- `pnpm build:watch` - Build in watch mode with Rollup
- `pnpm test` - Run tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:coverage` - Run tests with coverage
- `pnpm lint` - Lint code
- `pnpm lint:fix` - Lint and auto-fix issues
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting
- `pnpm validate` - Run all validation checks
- `pnpm type-check` - Type check TypeScript
- `pnpm clean` - Clean build artifacts

### Guidelines

- Use pnpm for dependency management
- Follow TypeScript best practices
- Maintain backward compatibility when possible
- Add tests for new features
- Update documentation as needed
- Follow the existing code style
- Ensure all checks pass: `pnpm validate`

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Author

**Muhammad Imran Siddique**
- GitHub: [@muimsd](https://github.com/muimsd)

## Repository

- GitHub: [https://github.com/muimsd/map-gl-style-changer](https://github.com/muimsd/map-gl-style-changer)
- Issues: [https://github.com/muimsd/map-gl-style-changer/issues](https://github.com/muimsd/map-gl-style-changer/issues)

---

Made with ❤️ for the MapLibre GL and Mapbox GL community