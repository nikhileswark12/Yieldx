import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock matchMedia since it's used in CountUp
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock canvas/chartjs elements that jsdom might complain about
HTMLCanvasElement.prototype.getContext = () => {};
