import { StyleSwitcherControl } from '../components/StyleSwitcherControl';
import type {
  StyleItem,
  StyleSwitcherControlOptions,
} from '../components/StyleSwitcherControl';

const styles: StyleItem[] = [
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

const added: StyleSwitcherControl[] = [];

function setup(options: Partial<StyleSwitcherControlOptions> = {}) {
  const control = new StyleSwitcherControl({ styles, ...options });
  const container = control.onAdd({});
  document.body.appendChild(container);
  added.push(control);

  const trigger = () =>
    container.querySelector('[role="combobox"]') as HTMLElement;
  const list = () => container.querySelector('[role="listbox"]') as HTMLElement;
  const items = () =>
    Array.from(container.querySelectorAll<HTMLElement>('[role="option"]'));
  const key = (k: string) =>
    trigger().dispatchEvent(
      new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })
    );
  const isOpen = () =>
    !list().hidden && trigger().getAttribute('aria-expanded') === 'true';

  return { control, container, trigger, list, items, key, isOpen };
}

function pointer(
  target: EventTarget,
  type: string,
  pointerType: 'mouse' | 'touch',
  bubbles = true
) {
  const event = new MouseEvent(type, { bubbles, cancelable: true });
  Object.defineProperty(event, 'pointerType', { value: pointerType });
  target.dispatchEvent(event);
  return event;
}

function press(target: HTMLElement, pointerType: 'mouse' | 'touch') {
  pointer(target, 'pointerdown', pointerType);
  target.click();
}

const hover = (el: HTMLElement) => pointer(el, 'pointerenter', 'mouse', false);
const unhover = (el: HTMLElement) =>
  pointer(el, 'pointerleave', 'mouse', false);

function mockDarkMode(matches: boolean) {
  const query = {
    matches,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn(() => query),
  });
  return query;
}

afterEach(() => {
  added.splice(0).forEach(control => control.onRemove());
  document.body.innerHTML = '';
  jest.restoreAllMocks();
  mockDarkMode(false);
});

describe('options', () => {
  it('throws when both showLabels and showImages are false', () => {
    const message = 'At least one of showLabels or showImages must be true.';
    expect(
      () =>
        new StyleSwitcherControl({
          styles,
          showLabels: false,
          showImages: false,
        })
    ).toThrow(message);

    const { control, items } = setup({ showImages: false });
    expect(() => control.updateOptions({ showLabels: false })).toThrow(message);
    // A rejected update leaves the control as it was.
    expect(items()[0].querySelector('span')).toBeTruthy();
  });

  it('uses defaults when options are explicitly undefined', () => {
    const { list } = setup({
      maxHeight: undefined,
      animationDuration: undefined,
    });
    expect(list().style.maxHeight).toBe('300px');
    expect(list().style.animationDuration).toBe('200ms');
  });

  it('restores a default when updateOptions receives undefined', () => {
    const { control, list } = setup({ maxHeight: 500, animationDuration: 400 });
    expect(list().style.maxHeight).toBe('500px');
    expect(list().style.animationDuration).toBe('400ms');

    control.updateOptions({
      maxHeight: undefined,
      animationDuration: undefined,
    });
    expect(list().style.maxHeight).toBe('300px');
    expect(list().style.animationDuration).toBe('200ms');
  });

  it('leaves omitted keys unchanged and keeps styles on undefined', () => {
    const { control, list, items } = setup({ maxHeight: 500 });
    control.updateOptions({ theme: 'dark', styles: undefined });
    expect(list().style.maxHeight).toBe('500px');
    expect(items()).toHaveLength(styles.length);
  });

  it('can be updated before being added to a map', () => {
    const control = new StyleSwitcherControl({ styles });
    control.updateOptions({ activeStyleId: 'satellite' });
    const container = control.onAdd({});
    added.push(control);
    expect(container.querySelector('[role="combobox"]')?.textContent).toBe(
      'Satellite'
    );
  });
});

describe('active style', () => {
  it('defaults to the first style', () => {
    expect(setup().trigger().textContent).toBe('Streets');
  });

  it('uses activeStyleId', () => {
    const { trigger, items } = setup({ activeStyleId: 'satellite' });
    expect(trigger().textContent).toBe('Satellite');
    expect(items()[1].getAttribute('aria-selected')).toBe('true');
    expect(items()[0].getAttribute('aria-selected')).toBe('false');
  });

  it('warns and falls back when the constructor id is unknown', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation();
    const onAfterStyleChange = jest.fn();
    const { trigger, items, control } = setup({
      activeStyleId: 'unknown',
      onAfterStyleChange,
    });
    expect(warn).toHaveBeenCalledWith(
      'StyleSwitcherControl: activeStyleId "unknown" does not match any style. Using first style instead.'
    );
    expect(trigger().textContent).toBe('Streets');

    // `from` must be the fallback style, never undefined.
    items()[1].click();
    expect(onAfterStyleChange).toHaveBeenCalledWith(styles[0], styles[1]);
    expect(control).toBeDefined();
  });

  it('updates via updateOptions without firing callbacks', () => {
    const onAfterStyleChange = jest.fn();
    const { control, trigger } = setup({ onAfterStyleChange });
    control.updateOptions({ activeStyleId: 'satellite' });
    expect(trigger().textContent).toBe('Satellite');
    expect(onAfterStyleChange).not.toHaveBeenCalled();
  });

  it('keeps the selection when updateOptions gets an unknown id', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation();
    const { control, trigger } = setup({ activeStyleId: 'satellite' });
    control.updateOptions({ activeStyleId: 'nope', styles });
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Keeping previous selection.')
    );
    expect(trigger().textContent).toBe('Satellite');
  });

  it('uses the first new style for new styles plus an unknown id', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation();
    const { control, trigger } = setup({ activeStyleId: 'streets' });
    const next = [styles[1], styles[0]];
    control.updateOptions({ styles: next, activeStyleId: 'nope' });
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Using first style instead.')
    );
    expect(trigger().textContent).toBe('Satellite');
  });

  it('accepts a combined update of styles and a new id', () => {
    const { control, trigger } = setup();
    const next: StyleItem[] = [
      { id: 'a', name: 'A', image: 'a.png', styleUrl: 'a' },
      { id: 'b', name: 'B', image: 'b.png', styleUrl: 'b' },
    ];
    control.updateOptions({ styles: next, activeStyleId: 'b' });
    expect(trigger().textContent).toBe('B');
  });

  it('falls back to the first style when the active one is removed', () => {
    const onAfterStyleChange = jest.fn();
    const { control, trigger, items } = setup({ onAfterStyleChange });
    const next = [styles[1], styles[2]];
    control.updateOptions({ styles: next });
    expect(trigger().textContent).toBe('Satellite');

    items()[1].click();
    expect(onAfterStyleChange).toHaveBeenCalledWith(next[0], next[1]);
  });

  it('keeps the selection when the new list still contains it', () => {
    const { control, trigger } = setup({ activeStyleId: 'satellite' });
    control.updateOptions({ styles: [styles[2], styles[1]] });
    expect(trigger().textContent).toBe('Satellite');
  });
});

describe('selecting a style', () => {
  it('fires callbacks in order and exposes the new state to onAfter', () => {
    const calls: string[] = [];
    const ref: { trigger?: () => HTMLElement } = {};
    const { trigger, items } = setup({
      onBeforeStyleChange: (from, to) => {
        calls.push(`before ${from.id}>${to.id} ${ref.trigger?.().textContent}`);
      },
      onAfterStyleChange: (from, to) => {
        calls.push(`after ${from.id}>${to.id} ${ref.trigger?.().textContent}`);
      },
    });
    ref.trigger = trigger;

    items()[1].click();
    expect(calls).toEqual([
      'before streets>satellite Streets',
      'after streets>satellite Satellite',
    ]);
    expect(items()[1].classList.contains('selected')).toBe(true);
    expect(items()[0].classList.contains('selected')).toBe(false);
  });

  it('does nothing when choosing the active style', () => {
    const onBeforeStyleChange = jest.fn();
    const onAfterStyleChange = jest.fn();
    const { items } = setup({ onBeforeStyleChange, onAfterStyleChange });
    items()[0].click();
    expect(onBeforeStyleChange).not.toHaveBeenCalled();
    expect(onAfterStyleChange).not.toHaveBeenCalled();
  });

  it('works without callbacks and from a click on the thumbnail', () => {
    const { items, trigger } = setup();
    items()[1].querySelector('img')?.click();
    expect(trigger().textContent).toBe('Satellite');
  });
});

describe('mouse', () => {
  it('opens on hover and closes on leave', () => {
    const { container, isOpen } = setup();
    expect(isOpen()).toBe(false);
    hover(container);
    expect(isOpen()).toBe(true);
    unhover(container);
    expect(isOpen()).toBe(false);
  });

  it('stays open after selecting so the pointer is not left stranded', () => {
    const { container, items, isOpen, trigger } = setup();
    hover(container);
    press(items()[1], 'mouse');
    expect(trigger().textContent).toBe('Satellite');
    expect(isOpen()).toBe(true);
  });

  it('does not close when clicking the trigger while hovering', () => {
    const { container, trigger, isOpen } = setup();
    hover(container);
    press(trigger(), 'mouse');
    expect(isOpen()).toBe(true);
  });

  it('reopens on click after Escape closed it during hover', () => {
    const { container, trigger, key, isOpen } = setup();
    hover(container);
    key('Escape');
    expect(isOpen()).toBe(false);
    press(trigger(), 'mouse');
    expect(isOpen()).toBe(true);
  });

  it('does not move focus when pressing inside the control', () => {
    const { container, trigger, items, isOpen } = setup();
    trigger().focus();
    hover(container);

    // Without preventDefault, the browser would blur the trigger on press,
    // closing the list before the option's click could fire.
    const event = pointer(items()[1], 'mousedown', 'mouse');
    expect(event.defaultPrevented).toBe(true);
    expect(isOpen()).toBe(true);
  });
});

describe('touch', () => {
  it('ignores touch hover events', () => {
    const { container, isOpen } = setup();
    pointer(container, 'pointerenter', 'touch', false);
    expect(isOpen()).toBe(false);
  });

  it('toggles with taps on the trigger', () => {
    const { trigger, isOpen } = setup();
    press(trigger(), 'touch');
    expect(isOpen()).toBe(true);
    press(trigger(), 'touch');
    expect(isOpen()).toBe(false);
  });

  it('closes after selecting', () => {
    const { trigger, items, isOpen } = setup();
    press(trigger(), 'touch');
    press(items()[1], 'touch');
    expect(trigger().textContent).toBe('Satellite');
    expect(isOpen()).toBe(false);
  });

  it('closes when tapping outside, but not inside', () => {
    const { trigger, items, isOpen } = setup();
    press(trigger(), 'touch');
    pointer(items()[0], 'pointerdown', 'touch');
    expect(isOpen()).toBe(true);
    pointer(document.body, 'pointerdown', 'touch');
    expect(isOpen()).toBe(false);
  });
});

describe('keyboard', () => {
  it.each(['Enter', ' ', 'ArrowDown', 'ArrowUp'])('opens with %j', k => {
    const { key, isOpen } = setup();
    key(k);
    expect(isOpen()).toBe(true);
  });

  it('does not open on focus alone', () => {
    const { trigger, isOpen } = setup();
    trigger().focus();
    expect(isOpen()).toBe(false);
  });

  // Regression: the list used to be destroyed as soon as focus moved to an
  // option, because that blurred the container. Real focus is required here.
  it('keeps real focus on the trigger and stays open while navigating', () => {
    const { trigger, key, isOpen } = setup();
    trigger().focus();
    key('Enter');
    key('ArrowDown');
    key('ArrowDown');
    expect(document.activeElement).toBe(trigger());
    expect(isOpen()).toBe(true);
  });

  it('starts on the selected option and exposes the highlight to AT', () => {
    const { trigger, items, key } = setup({ activeStyleId: 'satellite' });
    expect(trigger().hasAttribute('aria-activedescendant')).toBe(false);
    key('Enter');
    expect(trigger().getAttribute('aria-activedescendant')).toBe(items()[1].id);
    expect(items()[1].classList.contains('active')).toBe(true);
  });

  it('shows no highlight when opened by pointer', () => {
    const mouse = setup();
    hover(mouse.container);
    press(mouse.items()[1], 'mouse');
    expect(mouse.container.querySelector('.active')).toBeNull();
    expect(mouse.trigger().hasAttribute('aria-activedescendant')).toBe(false);

    const touch = setup();
    press(touch.trigger(), 'touch');
    expect(touch.container.querySelector('.active')).toBeNull();
  });

  it('continues from the selected style after a pointer open', () => {
    const { container, trigger, items, key } = setup({
      activeStyleId: 'satellite',
    });
    hover(container);
    key('ArrowDown');
    expect(trigger().getAttribute('aria-activedescendant')).toBe(items()[2].id);
  });

  it('closes without selecting on Enter when nothing is highlighted', () => {
    const onAfterStyleChange = jest.fn();
    const { container, key, isOpen } = setup({ onAfterStyleChange });
    hover(container);
    expect(() => key('Enter')).not.toThrow();
    expect(isOpen()).toBe(false);
    expect(onAfterStyleChange).not.toHaveBeenCalled();
  });

  it('moves with arrows, Home and End, and clamps at the ends', () => {
    const { trigger, items, key } = setup();
    const current = () => trigger().getAttribute('aria-activedescendant');
    key('Enter');
    key('ArrowUp');
    expect(current()).toBe(items()[0].id);
    key('ArrowDown');
    expect(current()).toBe(items()[1].id);
    expect(items()[0].classList.contains('active')).toBe(false);
    key('End');
    key('ArrowDown');
    expect(current()).toBe(items()[2].id);
    key('Home');
    expect(current()).toBe(items()[0].id);
  });

  it.each(['Enter', ' '])('selects the highlight and closes with %j', k => {
    const onAfterStyleChange = jest.fn();
    const { key, isOpen, trigger } = setup({ onAfterStyleChange });
    key('Enter');
    key('ArrowDown');
    key(k);
    expect(onAfterStyleChange).toHaveBeenCalledWith(styles[0], styles[1]);
    expect(isOpen()).toBe(false);
    expect(trigger().hasAttribute('aria-activedescendant')).toBe(false);
  });

  it('closes with Escape without selecting, keeping focus', () => {
    const onAfterStyleChange = jest.fn();
    const { trigger, key, isOpen } = setup({ onAfterStyleChange });
    trigger().focus();
    key('Enter');
    key('ArrowDown');
    key('Escape');
    expect(isOpen()).toBe(false);
    expect(onAfterStyleChange).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(trigger());
  });

  it('closes on blur', () => {
    const { trigger, key, isOpen } = setup();
    trigger().focus();
    key('Enter');
    trigger().blur();
    expect(isOpen()).toBe(false);
  });

  it('only prevents the default action of keys it handles', () => {
    const { trigger, key } = setup();
    key('Enter');
    const tab = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true });
    trigger().dispatchEvent(tab);
    expect(tab.defaultPrevented).toBe(false);
  });

  it('scrolls the highlighted option into view', () => {
    const { items, key } = setup();
    const scrollIntoView = jest.fn();
    items()[1].scrollIntoView = scrollIntoView;
    key('Enter');
    key('ArrowDown');
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' });
  });
});

describe('thumbnails', () => {
  it('reuses the same DOM across open, close and selection', () => {
    const { container, items, trigger } = setup();
    const before = items().map(item => item.querySelector('img'));
    const triggerImage = trigger().querySelector('img');

    hover(container);
    unhover(container);
    hover(container);
    expect(items().map(item => item.querySelector('img'))).toEqual(before);
    expect(trigger().querySelector('img')).toBe(triggerImage);

    items()[1].click();
    expect(items().map(item => item.querySelector('img'))).toEqual(before);
  });

  it('does not rebuild for a new but identical styles or classNames', () => {
    const { control, items } = setup({ classNames: { item: 'custom' } });
    const before = items()[0];
    control.updateOptions({
      styles: styles.map(style => ({ ...style })),
      classNames: { item: 'custom' },
    });
    expect(items()[0]).toBe(before);
  });

  it('updates thumbnails when the content does change', () => {
    const { control, trigger } = setup();
    control.updateOptions({
      styles: [{ ...styles[0], image: 'https://example.com/new.png' }],
    });
    expect(trigger().querySelector('img')?.getAttribute('src')).toBe(
      'https://example.com/new.png'
    );
  });

  it('defers list images and reserves their layout box', () => {
    const { items, trigger } = setup();
    const img = items()[0].querySelector('img') as HTMLImageElement;
    expect(img.getAttribute('loading')).toBe('lazy');
    expect(img.getAttribute('decoding')).toBe('async');
    expect(img.getAttribute('width')).toBe('32');
    expect(img.getAttribute('height')).toBe('32');
    expect(trigger().querySelector('img')?.getAttribute('loading')).toBe(
      'eager'
    );
  });

  it('names images only when there is no visible label', () => {
    expect(setup().items()[0].querySelector('img')?.alt).toBe('');
    const noLabels = setup({ showLabels: false });
    expect(noLabels.items()[0].querySelector('img')?.alt).toBe('Streets');
    expect(noLabels.trigger().querySelector('img')?.alt).toBe('Streets');
  });
});

describe('rendering', () => {
  it('builds the ARIA structure with unique ids per control', () => {
    const a = setup();
    const b = setup();
    expect(a.trigger().getAttribute('aria-label')).toBe('Style switcher');
    expect(a.trigger().getAttribute('aria-haspopup')).toBe('listbox');
    expect(a.trigger().getAttribute('aria-controls')).toBe(a.list().id);
    expect(a.trigger().tabIndex).toBe(0);
    expect(a.list().id).not.toBe(b.list().id);
    expect(a.items()[0].id).not.toBe(b.items()[0].id);
  });

  it('uses the description as the tooltip, falling back to the name', () => {
    const { items } = setup();
    expect(items()[0].title).toBe('Streets');
    expect(items()[2].title).toBe('Dark theme style');
  });

  it('respects showLabels and showImages, including on update', () => {
    const { control, items, trigger } = setup({ showLabels: false });
    expect(items()[0].classList.contains('hide-label')).toBe(true);
    expect(trigger().classList.contains('hide-label')).toBe(true);
    expect(trigger().querySelector('span')).toBeNull();

    control.updateOptions({ showLabels: true, showImages: false });
    expect(items()[0].classList.contains('hide-label')).toBe(false);
    expect(items()[0].querySelector('img')).toBeNull();
    expect(trigger().querySelector('img')).toBeNull();
    expect(trigger().textContent).toBe('Streets');
  });

  it('syncs the dir attribute with rtl', () => {
    const { control, container } = setup({ rtl: true });
    expect(container.getAttribute('dir')).toBe('rtl');
    control.updateOptions({ rtl: false });
    expect(container.hasAttribute('dir')).toBe(false);
  });

  it('applies custom class names, including multiple tokens', () => {
    const { container, items, list, control, trigger, key } = setup({
      classNames: {
        container: 'my-switcher extra',
        list: 'my-list',
        item: 'my-item',
        itemSelected: 'my-selected',
        itemActive: 'my-active',
        dark: 'my-dark theme',
      },
      theme: 'dark',
    });
    expect(container.className).toBe('my-switcher extra my-dark theme');
    expect(list().className).toBe('my-list');
    expect(items()[0].className).toBe('my-item my-selected');
    expect(trigger().className).toBe('my-item my-selected');
    key('Enter');
    expect(items()[0].className).toBe('my-item my-selected my-active');

    control.updateOptions({ classNames: { container: 'renamed' } });
    expect(container.classList.contains('my-switcher')).toBe(false);
    expect(container.classList.contains('renamed')).toBe(true);
    expect(list().className).toBe('style-switcher-list');
  });

  it('applies the outlined design and can remove it', () => {
    const { control, container } = setup({ design: 'outlined' });
    expect(container.classList.contains('style-switcher-outlined')).toBe(true);
    control.updateOptions({ design: 'default' });
    expect(container.classList.contains('style-switcher-outlined')).toBe(false);
  });
});

describe('theme', () => {
  const has = (el: HTMLElement, theme: string) =>
    el.classList.contains(`style-switcher-${theme}`);

  it('applies light by default, and dark on request', () => {
    expect(has(setup().container, 'light')).toBe(true);
    const dark = setup({ theme: 'dark' }).container;
    expect(has(dark, 'dark')).toBe(true);
    expect(has(dark, 'light')).toBe(false);
  });

  it.each([
    [true, 'dark'],
    [false, 'light'],
  ])('auto with prefers-dark=%s applies %s', (matches, theme) => {
    mockDarkMode(matches);
    expect(has(setup({ theme: 'auto' }).container, theme)).toBe(true);
  });

  it('tracks OS changes in auto mode and detaches on remove', () => {
    const query = mockDarkMode(false);
    const { control, container } = setup({ theme: 'auto' });
    expect(has(container, 'light')).toBe(true);

    const [, onChange] = query.addEventListener.mock.calls[0];
    query.matches = true;
    onChange();
    expect(has(container, 'dark')).toBe(true);
    expect(has(container, 'light')).toBe(false);

    control.onRemove();
    expect(query.removeEventListener).toHaveBeenCalledWith('change', onChange);
  });

  it('starts tracking OS changes when switched to auto after mount', () => {
    const query = mockDarkMode(false);
    const { control, container } = setup({ theme: 'light' });
    control.updateOptions({ theme: 'auto' });

    const [, onChange] = query.addEventListener.mock.calls[0];
    query.matches = true;
    onChange();
    expect(has(container, 'dark')).toBe(true);
  });

  it('ignores OS changes unless in auto mode', () => {
    const query = mockDarkMode(false);
    const { container } = setup({ theme: 'light' });
    const [, onChange] = query.addEventListener.mock.calls[0];
    query.matches = true;
    onChange();
    expect(has(container, 'light')).toBe(true);
  });

  it('works where matchMedia is unavailable', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: undefined,
    });
    expect(has(setup({ theme: 'auto' }).container, 'light')).toBe(true);
  });
});

describe('empty styles', () => {
  it('renders nothing and cannot open', () => {
    const { container, control } = setup({ styles: [] });
    expect(container.childElementCount).toBe(0);
    hover(container);
    expect(() => control.updateOptions({ theme: 'dark' })).not.toThrow();
    expect(container.childElementCount).toBe(0);
  });

  it('closes when emptied, and recovers when styles return', () => {
    const { container, control, isOpen, trigger } = setup();
    hover(container);
    control.updateOptions({ styles: [] });
    expect(container.childElementCount).toBe(0);

    control.updateOptions({ styles });
    expect(isOpen()).toBe(false);
    expect(trigger().textContent).toBe('Streets');
  });
});

describe('lifecycle', () => {
  it('removes the element and its document listener', () => {
    const remove = jest.spyOn(document, 'removeEventListener');
    const { control, container } = setup();
    control.onRemove();
    expect(container.isConnected).toBe(false);
    expect(remove).toHaveBeenCalledWith(
      'pointerdown',
      expect.any(Function),
      true
    );
  });

  it('is safe to remove twice, and events after removal are harmless', () => {
    const { control, container } = setup();
    const items = container.querySelectorAll<HTMLElement>('[role="option"]');
    hover(container);
    control.onRemove();
    expect(() => {
      control.onRemove();
      unhover(container);
      hover(container);
      items[1].click();
      pointer(document.body, 'pointerdown', 'mouse');
      control.updateOptions({ theme: 'dark' });
    }).not.toThrow();
  });

  it('can be re-added after removal, collapsed and with its selection', () => {
    const { control, container, items } = setup();
    hover(container);
    items()[1].click();
    control.onRemove();

    const next = control.onAdd({});
    expect(next).not.toBe(container);
    expect(next.querySelector('[role="combobox"]')?.textContent).toBe(
      'Satellite'
    );
    expect(
      next.querySelector('[role="combobox"]')?.getAttribute('aria-expanded')
    ).toBe('false');
    expect(next.querySelector<HTMLElement>('[role="listbox"]')?.hidden).toBe(
      true
    );
    expect(next.querySelectorAll('[role="option"]')).toHaveLength(
      styles.length
    );
  });
});
