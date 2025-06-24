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

    expect(container).toBeInTheDocument();
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
    expect(mockUseControl).toHaveBeenCalledWith(
      expect.any(Function),
      { position: 'bottom-left' }
    );
  });

  test('should use custom position when provided', () => {
    render(
      <MapGLStyleSwitcher
        styles={mockStyles}
        position="top-right"
        onStyleChange={mockOnStyleChange}
      />
    );

    expect(mockUseControl).toHaveBeenCalledWith(
      expect.any(Function),
      { position: 'top-right' }
    );
  });

  test('should work with minimal required props', () => {
    const { container } = render(
      <MapGLStyleSwitcher
        styles={mockStyles}
      />
    );

    expect(container).toBeInTheDocument();
    expect(mockUseControl).toHaveBeenCalledTimes(1);
  });

  test('should handle empty styles array', () => {
    render(
      <MapGLStyleSwitcher
        styles={[]}
        onStyleChange={mockOnStyleChange}
      />
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
});
