/**
 * @jest-environment jsdom
 */
import { renderHook, cleanup } from '@testing-library/react';
import { useStyleSwitcher } from '../components/useStyleSwitcher';
import { StyleSwitcherControl } from '../components/StyleSwitcherControl';
import type { StyleItem } from '../components/StyleSwitcherControl';

// Mock StyleSwitcherControl
jest.mock('../components/StyleSwitcherControl', () => ({
  StyleSwitcherControl: jest.fn(),
}));

const MockedStyleSwitcherControl = StyleSwitcherControl as jest.MockedClass<typeof StyleSwitcherControl>;

describe('useStyleSwitcher', () => {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockMap: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockControlInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockMap = {
      addControl: jest.fn(),
      removeControl: jest.fn(),
    };

    mockControlInstance = {
      onAdd: jest.fn(),
      onRemove: jest.fn(),
      getDefaultPosition: jest.fn(() => 'top-right'),
    };

    MockedStyleSwitcherControl.mockImplementation(() => mockControlInstance);
  });

  afterEach(() => {
    cleanup();
  });

  test('should not add control when map is null', () => {
    const { result } = renderHook(() =>
      useStyleSwitcher(null, {
        styles: mockStyles,
        activeStyleId: 'voyager',
      })
    );

    expect(MockedStyleSwitcherControl).not.toHaveBeenCalled();
    expect(result.current).toBeNull();
  });

  test('should add control to map when map is provided', () => {
    renderHook(() =>
      useStyleSwitcher(mockMap, {
        styles: mockStyles,
        activeStyleId: 'voyager',
      })
    );

    expect(MockedStyleSwitcherControl).toHaveBeenCalledWith({
      styles: mockStyles,
      activeStyleId: 'voyager',
    });
    expect(mockMap.addControl).toHaveBeenCalledWith(mockControlInstance, 'top-right');
  });

  test('should use custom position when provided', () => {
    renderHook(() =>
      useStyleSwitcher(mockMap, {
        styles: mockStyles,
        activeStyleId: 'voyager',
        position: 'bottom-left',
      })
    );

    expect(mockMap.addControl).toHaveBeenCalledWith(mockControlInstance, 'bottom-left');
  });

  test('should remove control when component unmounts', () => {
    const { unmount } = renderHook(() =>
      useStyleSwitcher(mockMap, {
        styles: mockStyles,
        activeStyleId: 'voyager',
      })
    );

    expect(mockMap.addControl).toHaveBeenCalledWith(mockControlInstance, 'top-right');

    unmount();

    expect(mockMap.removeControl).toHaveBeenCalledWith(mockControlInstance);
  });

  test('should remove and re-add control when map changes', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newMockMap: any = {
      addControl: jest.fn(),
      removeControl: jest.fn(),
    };

    const { rerender } = renderHook(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ({ map }: { map: any }) =>
        useStyleSwitcher(map, {
          styles: mockStyles,
          activeStyleId: 'voyager',
        }),
      {
        initialProps: { map: mockMap },
      }
    );

    expect(mockMap.addControl).toHaveBeenCalledWith(mockControlInstance, 'top-right');

    // Change the map
    rerender({ map: newMockMap });

    expect(mockMap.removeControl).toHaveBeenCalledWith(mockControlInstance);
    expect(newMockMap.addControl).toHaveBeenCalledWith(expect.any(Object), 'top-right');
  });

  test('should recreate control when options change', () => {
    const initialOptions = {
      styles: mockStyles,
      activeStyleId: 'voyager',
    };

    const { rerender } = renderHook(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ({ options }: { options: any }) => 
        useStyleSwitcher(mockMap, options),
      {
        initialProps: {
          options: initialOptions,
        },
      }
    );

    expect(MockedStyleSwitcherControl).toHaveBeenCalledTimes(1);
    expect(mockMap.addControl).toHaveBeenCalledTimes(1);

    // Change options
    const newOptions = {
      styles: mockStyles,
      activeStyleId: 'positron',
      theme: 'dark' as const,
    };

    rerender({
      options: newOptions,
    });

    // Should remove old control and add new one
    expect(mockMap.removeControl).toHaveBeenCalledWith(mockControlInstance);
    expect(MockedStyleSwitcherControl).toHaveBeenCalledTimes(2);
    expect(MockedStyleSwitcherControl).toHaveBeenLastCalledWith({
      styles: mockStyles,
      activeStyleId: 'positron',
      theme: 'dark',
    });
    expect(mockMap.addControl).toHaveBeenCalledTimes(2);
  });

  test('should recreate control when position changes', () => {
    const { rerender } = renderHook(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ({ position }: { position: any }) =>
        useStyleSwitcher(mockMap, {
          styles: mockStyles,
          activeStyleId: 'voyager',
          position,
        }),
      {
        initialProps: { position: 'top-right' },
      }
    );

    expect(mockMap.addControl).toHaveBeenCalledWith(mockControlInstance, 'top-right');

    // Change position
    rerender({ position: 'bottom-left' });

    expect(mockMap.removeControl).toHaveBeenCalledWith(mockControlInstance);
    expect(mockMap.addControl).toHaveBeenCalledWith(expect.any(Object), 'bottom-left');
  });

  test('should handle all control options', () => {
    const onBeforeStyleChange = jest.fn();
    const onAfterStyleChange = jest.fn();

    renderHook(() =>
      useStyleSwitcher(mockMap, {
        styles: mockStyles,
        activeStyleId: 'voyager',
        onBeforeStyleChange,
        onAfterStyleChange,
        theme: 'light',
        position: 'top-left',
        showLabels: true,
        showImages: false,
      })
    );

    expect(MockedStyleSwitcherControl).toHaveBeenCalledWith({
      styles: mockStyles,
      activeStyleId: 'voyager',
      onBeforeStyleChange,
      onAfterStyleChange,
      theme: 'light',
      showLabels: true,
      showImages: false,
    });
    expect(mockMap.addControl).toHaveBeenCalledWith(mockControlInstance, 'top-left');
  });

  test('should handle map becoming null', () => {
    const { rerender } = renderHook(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ({ map }: { map: any }) =>
        useStyleSwitcher(map, {
          styles: mockStyles,
          activeStyleId: 'voyager',
        }),
      {
        initialProps: { map: mockMap },
      }
    );

    expect(mockMap.addControl).toHaveBeenCalledWith(mockControlInstance, 'top-right');

    // Set map to null
    rerender({ map: null });

    expect(mockMap.removeControl).toHaveBeenCalledWith(mockControlInstance);
  });

  test('should not crash when trying to remove control from cleaned up map', () => {
    const { unmount } = renderHook(() =>
      useStyleSwitcher(mockMap, {
        styles: mockStyles,
        activeStyleId: 'voyager',
      })
    );

    // Should not throw when unmounting
    expect(() => unmount()).not.toThrow();
    expect(mockMap.removeControl).toHaveBeenCalledWith(mockControlInstance);
  });
});
