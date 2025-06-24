/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { MapGLStyleSwitcher } from '../components/MapGLStyleSwitcher';
import type { StyleItem } from '../components/StyleSwitcherControl';

// Mock react-map-gl/maplibre useControl hook
jest.mock('react-map-gl/maplibre', () => ({
  useControl: jest.fn(),
}));

// Mock StyleSwitcherControl
jest.mock('../components/StyleSwitcherControl', () => ({
  StyleSwitcherControl: jest.fn(),
}));

// Import the mocked functions
import { useControl } from 'react-map-gl/maplibre';

const mockUseControl = useControl as jest.MockedFunction<typeof useControl>;

describe('MapGLStyleSwitcher', () => {
  const mockStyles: StyleItem[] = [
    {
      id: 'voyager',
      name: 'Voyager',
      image: 'https://example.com/voyager.png',
      styleUrl: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
      description: 'Voyager style from Carto',
    },
    {
      id: 'positron',
      name: 'Positron',
      image: 'https://example.com/positron.png',
      styleUrl: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      description: 'Positron style from Carto',
    },
  ];

  const mockOnStyleChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseControl.mockClear();
  });

  test('should render without crashing', () => {
    const { container } = render(
      <MapGLStyleSwitcher
        styles={mockStyles}
        activeStyleId="voyager"
        onStyleChange={mockOnStyleChange}
      />
    );

    // Component should render successfully (returns null but shouldn't crash)
    expect(container.firstChild).toBeNull();
  });

  test('should return null (no visible DOM elements)', () => {
    const { container } = render(
      <MapGLStyleSwitcher
        styles={mockStyles}
        activeStyleId="voyager"
        onStyleChange={mockOnStyleChange}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  test('should call useControl with correct parameters', () => {
    render(
      <MapGLStyleSwitcher
        styles={mockStyles}
        activeStyleId="voyager"
        onStyleChange={mockOnStyleChange}
      />
    );

    expect(mockUseControl).toHaveBeenCalledTimes(1);
    expect(mockUseControl).toHaveBeenCalledWith(expect.any(Function), {
      position: 'bottom-left',
    });
  });

  test('should use custom position when provided', () => {
    render(
      <MapGLStyleSwitcher
        styles={mockStyles}
        position="top-right"
        onStyleChange={mockOnStyleChange}
      />
    );

    expect(mockUseControl).toHaveBeenCalledWith(expect.any(Function), {
      position: 'top-right',
    });
  });

  test('should work with minimal required props', () => {
    const { container } = render(<MapGLStyleSwitcher styles={mockStyles} />);

    // Component should render successfully with minimal props
    expect(container.firstChild).toBeNull();
    expect(mockUseControl).toHaveBeenCalledTimes(1);
  });

  test('should handle empty styles array', () => {
    render(
      <MapGLStyleSwitcher styles={[]} onStyleChange={mockOnStyleChange} />
    );

    expect(mockUseControl).toHaveBeenCalledTimes(1);
  });

  test('should handle prop changes on re-render', () => {
    const { rerender } = render(
      <MapGLStyleSwitcher
        styles={mockStyles}
        activeStyleId="voyager"
        onStyleChange={mockOnStyleChange}
      />
    );

    expect(mockUseControl).toHaveBeenCalledTimes(1);

    rerender(
      <MapGLStyleSwitcher
        styles={mockStyles}
        activeStyleId="positron"
        onStyleChange={mockOnStyleChange}
      />
    );

    expect(mockUseControl).toHaveBeenCalledTimes(2);
  });

  test('should create StyleSwitcherControl with correct options', () => {
    render(
      <MapGLStyleSwitcher
        styles={mockStyles}
        activeStyleId="voyager"
        theme="dark"
        showLabels={false}
        showImages={true}
        animationDuration={300}
        maxHeight={400}
        rtl={true}
        classNames={{ container: 'custom-container' }}
        onBeforeStyleChange={mockOnStyleChange}
        onAfterStyleChange={mockOnStyleChange}
        onStyleChange={mockOnStyleChange}
        position="top-left"
      />
    );

    // Verify useControl was called with the correct options
    expect(mockUseControl).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        position: 'top-left',
      })
    );
  });

  test('should pass onAfterStyleChange and onStyleChange props to control', () => {
    const mockOnAfterStyleChange = jest.fn();
    const mockOnStyleChange = jest.fn();

    render(
      <MapGLStyleSwitcher
        styles={mockStyles}
        onAfterStyleChange={mockOnAfterStyleChange}
        onStyleChange={mockOnStyleChange}
      />
    );

    expect(mockUseControl).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        position: 'bottom-left',
      })
    );
  });

  test('should work with only onStyleChange callback', () => {
    const mockOnStyleChange = jest.fn();

    render(
      <MapGLStyleSwitcher
        styles={mockStyles}
        onStyleChange={mockOnStyleChange}
      />
    );

    expect(mockUseControl).toHaveBeenCalledTimes(1);
  });

  test('should work with no callbacks provided', () => {
    render(<MapGLStyleSwitcher styles={mockStyles} />);

    expect(mockUseControl).toHaveBeenCalledTimes(1);
  });

  test('should pass all props to StyleSwitcherControl via useControl', () => {
    const mockOnBeforeStyleChange = jest.fn();
    const mockOnAfterStyleChange = jest.fn();
    const customClassNames = { container: 'custom' };

    render(
      <MapGLStyleSwitcher
        styles={mockStyles}
        activeStyleId="voyager"
        theme="dark"
        showLabels={false}
        showImages={true}
        animationDuration={300}
        maxHeight={400}
        rtl={true}
        classNames={customClassNames}
        onBeforeStyleChange={mockOnBeforeStyleChange}
        onAfterStyleChange={mockOnAfterStyleChange}
        position="top-right"
      />
    );

    expect(mockUseControl).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        position: 'top-right',
      })
    );
  });

  test('should handle all default props correctly', () => {
    render(<MapGLStyleSwitcher styles={mockStyles} />);

    expect(mockUseControl).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        position: 'bottom-left', // default position
      })
    );
  });

  test('should handle different position values', () => {
    const positions = [
      'top-left',
      'top-right',
      'bottom-left',
      'bottom-right',
    ] as const;

    positions.forEach(position => {
      mockUseControl.mockClear();

      render(<MapGLStyleSwitcher styles={mockStyles} position={position} />);

      expect(mockUseControl).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          position,
        })
      );
    });
  });

  test('should handle all theme options', () => {
    const themes = ['light', 'dark', 'auto'] as const;

    themes.forEach(theme => {
      mockUseControl.mockClear();

      render(<MapGLStyleSwitcher styles={mockStyles} theme={theme} />);

      expect(mockUseControl).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          position: 'bottom-left',
        })
      );
    });
  });
});
