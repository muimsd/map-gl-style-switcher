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

const MockedStyleSwitcherControl = StyleSwitcherControl as jest.MockedClass<
  typeof StyleSwitcherControl
>;

describe('useStyleSwitcher', () => {
  const mockStyles: StyleItem[] = [
    {
      id: 'voyager',
      name: 'Voyager',
      image:
        'https://github.com/muimsd/map-gl-style-switcher/tree/main/public/voyager.png',
      styleUrl: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
      description: 'Voyager style from Carto',
    },
    {
      id: 'positron',
      name: 'Positron',
      image:
        'https://github.com/muimsd/map-gl-style-switcher/tree/main/public/positron.png',
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
      updateOptions: jest.fn(),
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

    expect(MockedStyleSwitcherControl).toHaveBeenCalledWith(
      expect.objectContaining({
        styles: mockStyles,
        activeStyleId: 'voyager',
      })
    );
    expect(mockMap.addControl).toHaveBeenCalledWith(
      mockControlInstance,
      'top-right'
    );
  });

  test('should return the control once it has been added', () => {
    const { result } = renderHook(() =>
      useStyleSwitcher(mockMap, { styles: mockStyles })
    );

    expect(result.current).toBe(mockControlInstance);
  });

  test('should add the control when the map becomes available', () => {
    const { rerender, result } = renderHook(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ({ map }: { map: any }) => useStyleSwitcher(map, { styles: mockStyles }),
      { initialProps: { map: null } }
    );
    expect(result.current).toBeNull();

    rerender({ map: mockMap });

    expect(mockMap.addControl).toHaveBeenCalledTimes(1);
    expect(result.current).toBe(mockControlInstance);
  });

  test('should use custom position when provided', () => {
    renderHook(() =>
      useStyleSwitcher(mockMap, {
        styles: mockStyles,
        activeStyleId: 'voyager',
        position: 'bottom-left',
      })
    );

    expect(mockMap.addControl).toHaveBeenCalledWith(
      mockControlInstance,
      'bottom-left'
    );
  });

  test('should remove control when component unmounts', () => {
    const { unmount } = renderHook(() =>
      useStyleSwitcher(mockMap, {
        styles: mockStyles,
        activeStyleId: 'voyager',
      })
    );

    expect(mockMap.addControl).toHaveBeenCalledWith(
      mockControlInstance,
      'top-right'
    );

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

    expect(mockMap.addControl).toHaveBeenCalledWith(
      mockControlInstance,
      'top-right'
    );

    // Change the map
    rerender({ map: newMockMap });

    expect(mockMap.removeControl).toHaveBeenCalledWith(mockControlInstance);
    expect(newMockMap.addControl).toHaveBeenCalledWith(
      expect.any(Object),
      'top-right'
    );
  });

  describe('option changes', () => {
    const render = (options: object) =>
      renderHook(
        ({ options }) =>
          useStyleSwitcher(mockMap, { styles: mockStyles, ...options }),
        { initialProps: { options } }
      );

    test('should update the existing control instead of recreating it', () => {
      const { rerender } = render({ activeStyleId: 'voyager' });

      rerender({ options: { activeStyleId: 'positron', theme: 'dark' } });

      expect(MockedStyleSwitcherControl).toHaveBeenCalledTimes(1);
      expect(mockMap.addControl).toHaveBeenCalledTimes(1);
      expect(mockMap.removeControl).not.toHaveBeenCalled();
      expect(mockControlInstance.updateOptions).toHaveBeenCalledWith(
        expect.objectContaining({
          styles: mockStyles,
          activeStyleId: 'positron',
          theme: 'dark',
        })
      );
    });

    test('should not update on mount or when options are deep-equal', () => {
      const { rerender } = render({ theme: 'dark' });
      rerender({ options: { theme: 'dark' } });

      expect(mockControlInstance.updateOptions).not.toHaveBeenCalled();
    });

    test('should restore the default of an option that is dropped', () => {
      const { rerender } = render({ theme: 'dark', maxHeight: 100 });

      rerender({ options: { maxHeight: 100 } });

      const update = mockControlInstance.updateOptions.mock.calls[0][0];
      expect(update).toHaveProperty('theme', undefined);
      expect(update.maxHeight).toBe(100);
    });

    test('should not pass callbacks to updateOptions', () => {
      const { rerender } = render({ theme: 'dark' });

      rerender({
        options: { theme: 'light', onAfterStyleChange: jest.fn() },
      });

      const update = mockControlInstance.updateOptions.mock.calls[0][0];
      expect(update).not.toHaveProperty('onAfterStyleChange');
      expect(update).not.toHaveProperty('onBeforeStyleChange');
    });
  });

  test('should always call the latest callbacks without recreating', () => {
    const stale = jest.fn();
    const latest = jest.fn();
    const staleBefore = jest.fn();
    const latestBefore = jest.fn();

    const { rerender } = renderHook(
      ({ onAfter, onBefore }) =>
        useStyleSwitcher(mockMap, {
          styles: mockStyles,
          onAfterStyleChange: onAfter,
          onBeforeStyleChange: onBefore,
        }),
      { initialProps: { onAfter: stale, onBefore: staleBefore } }
    );
    rerender({ onAfter: latest, onBefore: latestBefore });

    expect(MockedStyleSwitcherControl).toHaveBeenCalledTimes(1);
    expect(mockControlInstance.updateOptions).not.toHaveBeenCalled();

    const options = MockedStyleSwitcherControl.mock.calls[0][0];
    options.onBeforeStyleChange?.(mockStyles[0], mockStyles[1]);
    options.onAfterStyleChange?.(mockStyles[0], mockStyles[1]);

    expect(stale).not.toHaveBeenCalled();
    expect(staleBefore).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledWith(mockStyles[0], mockStyles[1]);
    expect(latestBefore).toHaveBeenCalledWith(mockStyles[0], mockStyles[1]);
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

    expect(mockMap.addControl).toHaveBeenCalledWith(
      mockControlInstance,
      'top-right'
    );

    // Change position
    rerender({ position: 'bottom-left' });

    expect(mockMap.removeControl).toHaveBeenCalledWith(mockControlInstance);
    expect(mockMap.addControl).toHaveBeenCalledWith(
      expect.any(Object),
      'bottom-left'
    );
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
      onBeforeStyleChange: expect.any(Function),
      onAfterStyleChange: expect.any(Function),
      theme: 'light',
      showLabels: true,
      showImages: false,
    });
    expect(mockMap.addControl).toHaveBeenCalledWith(
      mockControlInstance,
      'top-left'
    );
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

    expect(mockMap.addControl).toHaveBeenCalledWith(
      mockControlInstance,
      'top-right'
    );

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
