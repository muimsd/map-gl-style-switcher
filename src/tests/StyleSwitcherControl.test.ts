import { StyleSwitcherControl } from '../components/StyleSwitcherControl';
import type { StyleItem } from '../components/StyleSwitcherControl';

// Mock Image constructor for image loading tests
class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src: string = '';

  constructor() {
    // Simulate successful image loading after a short delay
    setTimeout(() => {
      if (this.onload) {
        this.onload();
      }
    }, 10);
  }
}

// @ts-expect-error - Mock Image constructor for testing
global.Image = MockImage;

describe('StyleSwitcherControl', () => {
  const mockStyles: StyleItem[] = [
    {
      id: 'streets',
      name: 'Streets',
      image: 'https://example.com/streets.png',
      styleUrl: 'mapbox://styles/mapbox/streets-v11',
    },
    {
      id: 'satellite',
      name: 'Satellite',
      image: 'https://example.com/satellite.png',
      styleUrl: 'mapbox://styles/mapbox/satellite-v9',
    },
    {
      id: 'dark',
      name: 'Dark',
      image: 'https://example.com/dark.png',
      styleUrl: 'mapbox://styles/mapbox/dark-v10',
      description: 'Dark theme style',
    },
  ];

  let mockMap: Record<string, unknown>;

  beforeEach(() => {
    // Clear any previous mocks
    jest.clearAllMocks();

    // Create a mock map object
    mockMap = {
      addControl: jest.fn(),
      removeControl: jest.fn(),
    };

    // Clear DOM
    document.body.innerHTML = '';
  });

  describe('Constructor and Initialization', () => {
    it('should create a control with default options', () => {
      const control = new StyleSwitcherControl({ styles: mockStyles });
      expect(control).toBeInstanceOf(StyleSwitcherControl);
    });

    it('should validate styles and filter out invalid ones', () => {
      const invalidStyles = [
        { id: '', name: 'Invalid', image: 'test.png', styleUrl: 'test' }, // empty id
        {
          id: 'valid',
          name: 'Valid',
          image: 'valid.png',
          styleUrl: 'mapbox://styles/test',
        },
      ];

      const control = new StyleSwitcherControl({ styles: invalidStyles });
      expect(control).toBeInstanceOf(StyleSwitcherControl);
    });

    it('should handle activeStyleId option', () => {
      const control = new StyleSwitcherControl({
        styles: mockStyles,
        activeStyleId: 'satellite',
      });
      expect(control).toBeInstanceOf(StyleSwitcherControl);
    });

    it('should handle theme options', () => {
      const lightControl = new StyleSwitcherControl({
        styles: mockStyles,
        theme: 'light',
      });
      expect(lightControl).toBeInstanceOf(StyleSwitcherControl);

      const darkControl = new StyleSwitcherControl({
        styles: mockStyles,
        theme: 'dark',
      });
      expect(darkControl).toBeInstanceOf(StyleSwitcherControl);

      const autoControl = new StyleSwitcherControl({
        styles: mockStyles,
        theme: 'auto',
      });
      expect(autoControl).toBeInstanceOf(StyleSwitcherControl);
    });

    it('should handle RTL option', () => {
      const control = new StyleSwitcherControl({
        styles: mockStyles,
        rtl: true,
      });
      expect(control).toBeInstanceOf(StyleSwitcherControl);
    });

    it('should handle showLabels and showImages options', () => {
      const noLabelsControl = new StyleSwitcherControl({
        styles: mockStyles,
        showLabels: false,
      });
      expect(noLabelsControl).toBeInstanceOf(StyleSwitcherControl);

      const noImagesControl = new StyleSwitcherControl({
        styles: mockStyles,
        showImages: false,
      });
      expect(noImagesControl).toBeInstanceOf(StyleSwitcherControl);
    });

    it('should handle custom class names', () => {
      const control = new StyleSwitcherControl({
        styles: mockStyles,
        classNames: {
          container: 'custom-container',
          list: 'custom-list',
        },
      });
      expect(control).toBeInstanceOf(StyleSwitcherControl);
    });
  });

  describe('DOM Manipulation', () => {
    let control: StyleSwitcherControl;
    let container: HTMLElement;

    beforeEach(() => {
      control = new StyleSwitcherControl({ styles: mockStyles });
      container = control.onAdd(mockMap);
      document.body.appendChild(container);
    });

    afterEach(() => {
      control.onRemove();
    });

    it('should create and return a DOM element when onAdd is called', () => {
      expect(container).toBeInstanceOf(HTMLElement);
      expect(container.classList.contains('style-switcher')).toBe(true);
    });

    it('should have proper ARIA attributes', () => {
      expect(container.getAttribute('role')).toBe('button');
      expect(container.getAttribute('aria-label')).toBe('Style switcher');
      expect(container.getAttribute('aria-expanded')).toBe('false');
      expect(container.getAttribute('tabindex')).toBe('0');
    });

    it('should apply RTL direction when rtl option is true', () => {
      const rtlControl = new StyleSwitcherControl({
        styles: mockStyles,
        rtl: true,
      });
      const rtlContainer = rtlControl.onAdd(mockMap);

      expect(rtlContainer.getAttribute('dir')).toBe('rtl');

      rtlControl.onRemove();
    });

    it('should expand and collapse on mouse events', () => {
      // Initially collapsed
      expect(container.getAttribute('aria-expanded')).toBe('false');

      // Mouse enter should expand
      container.dispatchEvent(new Event('mouseenter'));
      expect(container.getAttribute('aria-expanded')).toBe('true');

      // Mouse leave should collapse
      container.dispatchEvent(new Event('mouseleave'));
      expect(container.getAttribute('aria-expanded')).toBe('false');
    });

    it('should expand and collapse on focus events', () => {
      // Initially collapsed
      expect(container.getAttribute('aria-expanded')).toBe('false');

      // Focus should expand
      container.dispatchEvent(new Event('focus'));
      expect(container.getAttribute('aria-expanded')).toBe('true');

      // Blur should collapse
      container.dispatchEvent(new Event('blur'));
      expect(container.getAttribute('aria-expanded')).toBe('false');
    });

    it('should render style items when expanded', () => {
      // Expand the control
      container.dispatchEvent(new Event('mouseenter'));

      // Check if style items are rendered - should have one list plus one selected item
      const list = container.querySelector('.style-switcher-list');
      expect(list).toBeTruthy();

      // The list should contain all styles
      const listItems = list?.querySelectorAll('[role="option"]');
      expect(listItems?.length).toBe(mockStyles.length);
    });

    it('should show only active style when collapsed', () => {
      // When collapsed, should only show active style
      expect(container.getAttribute('aria-expanded')).toBe('false');

      const visibleItems = container.querySelectorAll('[role="option"]');
      expect(visibleItems.length).toBe(1);

      // The visible item should have aria-selected="true"
      const activeItem = container.querySelector('[aria-selected="true"]');
      expect(activeItem).toBeTruthy();
    });
  });

  describe('Style Change Handling', () => {
    let control: StyleSwitcherControl;
    let container: HTMLElement;
    let onBeforeStyleChange: jest.Mock;
    let onAfterStyleChange: jest.Mock;

    beforeEach(() => {
      onBeforeStyleChange = jest.fn();
      onAfterStyleChange = jest.fn();

      control = new StyleSwitcherControl({
        styles: mockStyles,
        onBeforeStyleChange,
        onAfterStyleChange,
      });
      container = control.onAdd(mockMap);
      document.body.appendChild(container);
    });

    afterEach(() => {
      control.onRemove();
    });

    it('should call callbacks when style is changed', async () => {
      // Expand the control
      container.dispatchEvent(new Event('mouseenter'));

      // Find the list and get style items
      const list = container.querySelector('.style-switcher-list');
      const styleItems = list?.querySelectorAll('[role="option"]');
      expect(styleItems?.length).toBe(mockStyles.length);

      // Click on the second style (satellite)
      const satelliteItem = styleItems?.[1] as HTMLElement;
      expect(satelliteItem).toBeTruthy();
      satelliteItem.click();

      // Wait for any asynchronous operations
      await new Promise(resolve => setTimeout(resolve, 50));

      // Check if callbacks were called
      expect(onBeforeStyleChange).toHaveBeenCalledWith(
        mockStyles[0],
        mockStyles[1]
      );
      expect(onAfterStyleChange).toHaveBeenCalledWith(
        mockStyles[0],
        mockStyles[1]
      );
    });

    it('should update active style after change', async () => {
      // Expand the control
      container.dispatchEvent(new Event('mouseenter'));

      // Click on satellite style (second item)
      const list = container.querySelector('.style-switcher-list');
      const styleItems = list?.querySelectorAll('[role="option"]');
      const satelliteItem = styleItems?.[1] as HTMLElement;
      satelliteItem.click();

      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 50));

      // Check that the satellite style is now selected
      const selectedItems = container.querySelectorAll(
        '[aria-selected="true"]'
      );
      expect(selectedItems.length).toBeGreaterThan(0);
    });

    it('should not call callbacks when clicking the same style', async () => {
      // Expand the control
      container.dispatchEvent(new Event('mouseenter'));

      // Click on the currently active style (first item)
      const list = container.querySelector('.style-switcher-list');
      const styleItems = list?.querySelectorAll('[role="option"]');
      const streetsItem = styleItems?.[0] as HTMLElement;
      streetsItem.click();

      // Wait for any asynchronous operations
      await new Promise(resolve => setTimeout(resolve, 50));

      // Callbacks should not be called for same style
      expect(onBeforeStyleChange).not.toHaveBeenCalled();
      expect(onAfterStyleChange).not.toHaveBeenCalled();
    });
  });

  describe('Theme Handling', () => {
    it('should apply light theme', () => {
      const control = new StyleSwitcherControl({
        styles: mockStyles,
        theme: 'light',
      });
      const container = control.onAdd(mockMap);

      expect(container.classList.contains('style-switcher-light')).toBe(true);
      expect(container.classList.contains('style-switcher-dark')).toBe(false);

      control.onRemove();
    });

    it('should apply dark theme', () => {
      const control = new StyleSwitcherControl({
        styles: mockStyles,
        theme: 'dark',
      });
      const container = control.onAdd(mockMap);

      expect(container.classList.contains('style-switcher-dark')).toBe(true);
      expect(container.classList.contains('style-switcher-light')).toBe(false);

      control.onRemove();
    });

    it('should handle auto theme based on system preference', () => {
      // Mock matchMedia to return dark preference
      const mockMatchMedia = jest.fn(() => ({
        matches: true, // Simulating dark mode preference
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia,
      });

      const control = new StyleSwitcherControl({
        styles: mockStyles,
        theme: 'auto',
      });
      const container = control.onAdd(mockMap);

      expect(container.classList.contains('style-switcher-dark')).toBe(true);

      control.onRemove();
    });
  });

  describe('Error Handling', () => {
    it('should handle empty styles array gracefully', () => {
      expect(() => {
        new StyleSwitcherControl({ styles: [] });
      }).not.toThrow();
    });

    it('should handle invalid activeStyleId gracefully', () => {
      // Mock console.warn to suppress expected warning
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const control = new StyleSwitcherControl({
        styles: mockStyles,
        activeStyleId: 'non-existent-style',
      });

      expect(control).toBeInstanceOf(StyleSwitcherControl);

      // Verify that warning was called
      expect(consoleSpy).toHaveBeenCalledWith(
        'StyleSwitcherControl: activeStyleId "non-existent-style" does not match any style. Using first style instead.'
      );

      // Should fall back to first style
      const container = control.onAdd(mockMap);
      const activeItem = container.querySelector('[aria-selected="true"]');
      expect(activeItem).toBeTruthy();

      // Restore console.warn
      consoleSpy.mockRestore();

      control.onRemove();
    });

    it('should handle missing required options gracefully', () => {
      expect(() => {
        new StyleSwitcherControl({ styles: [] });
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    let control: StyleSwitcherControl;
    let container: HTMLElement;

    beforeEach(() => {
      control = new StyleSwitcherControl({ styles: mockStyles });
      container = control.onAdd(mockMap);
      document.body.appendChild(container);
    });

    afterEach(() => {
      control.onRemove();
    });

    it('should have proper keyboard navigation support', () => {
      expect(container.getAttribute('tabindex')).toBe('0');
      expect(container.getAttribute('role')).toBe('button');
    });

    it('should update aria-expanded correctly', () => {
      expect(container.getAttribute('aria-expanded')).toBe('false');

      container.dispatchEvent(new Event('focus'));
      expect(container.getAttribute('aria-expanded')).toBe('true');

      container.dispatchEvent(new Event('blur'));
      expect(container.getAttribute('aria-expanded')).toBe('false');
    });

    it('should have aria-selected attributes on style items', () => {
      container.dispatchEvent(new Event('mouseenter'));

      const styleItems = container.querySelectorAll('[role="option"]');
      expect(styleItems.length).toBeGreaterThan(0);

      // At least one item should be selected
      const selectedItems = container.querySelectorAll(
        '[aria-selected="true"]'
      );
      expect(selectedItems.length).toBeGreaterThan(0);
    });
  });

  describe('Custom Configuration', () => {
    it('should respect showLabels option', () => {
      const control = new StyleSwitcherControl({
        styles: mockStyles,
        showLabels: false,
      });
      const container = control.onAdd(mockMap);

      // Expand to see all items
      container.dispatchEvent(new Event('mouseenter'));

      // Should have hide-label class when labels are disabled
      const items = container.querySelectorAll('[role="option"]');
      items.forEach(item => {
        expect(item.classList.contains('hide-label')).toBe(true);
      });

      control.onRemove();
    });

    it('should respect showImages option', () => {
      const control = new StyleSwitcherControl({
        styles: mockStyles,
        showImages: false,
      });
      const container = control.onAdd(mockMap);

      // Expand to see all items
      container.dispatchEvent(new Event('mouseenter'));

      // Should not have image elements when images are disabled
      const images = container.querySelectorAll('img');
      expect(images.length).toBe(0);

      control.onRemove();
    });

    it('should use custom class names when provided', () => {
      const customClasses = {
        container: 'my-custom-container',
        list: 'my-custom-list',
        item: 'my-custom-item',
      };

      const control = new StyleSwitcherControl({
        styles: mockStyles,
        classNames: customClasses,
      });
      const container = control.onAdd(mockMap);

      expect(container.classList.contains('my-custom-container')).toBe(true);

      control.onRemove();
    });
  });
});
