import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let store: Record<string, string>;
  let prefersDark: boolean;

  beforeEach(() => {
    store = {};
    prefersDark = false;
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem: vi.fn((key: string, value: string) => (store[key] = value)),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, 'matchMedia', {
      value: vi.fn(() => ({ matches: prefersDark })),
      writable: true,
      configurable: true,
    });
    document.documentElement.removeAttribute('data-theme');
    TestBed.configureTestingModule({ providers: [ThemeService] });
  });

  afterEach(() => {
    vi.clearAllMocks();
    TestBed.resetTestingModule();
  });

  it('defaults to light when nothing is saved and the OS prefers light', () => {
    const service = TestBed.inject(ThemeService);
    expect(service.theme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('follows the OS dark preference when nothing is saved', () => {
    prefersDark = true;
    const service = TestBed.inject(ThemeService);
    expect(service.theme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('prefers the saved theme over the OS preference', () => {
    prefersDark = true;
    store['theme'] = 'light';
    const service = TestBed.inject(ThemeService);
    expect(service.theme()).toBe('light');
  });

  it('toggles, applies and persists the theme', () => {
    const service = TestBed.inject(ThemeService);
    service.toggle();
    expect(service.theme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(store['theme']).toBe('dark');

    service.toggle();
    expect(service.theme()).toBe('light');
    expect(store['theme']).toBe('light');
  });
});
