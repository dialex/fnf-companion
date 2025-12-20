import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import App from '../../App';

// Mock external dependencies
vi.mock('../../utils/theme', () => ({
  getCurrentTheme: () => 'default',
  setTheme: vi.fn(),
  initTheme: vi.fn(),
  getAvailableThemes: () => ['default', 'light', 'dark'],
  THEMES: { LIGHT: 'light', DARK: 'dark' },
}));

vi.mock('../../utils/palette', () => ({
  initPalette: vi.fn(),
  getCurrentPalette: () => 'default',
  setPalette: vi.fn(),
}));

vi.mock('../../managers/stateManager', () => ({
  loadState: () => null,
  saveState: vi.fn(),
  buildStateObject: vi.fn(),
  applyLoadedState: vi.fn(),
  createDebouncedSave: () => vi.fn(),
  getDefaultState: () => ({
    sounds: {
      ambienceVolume: 50,
      battleVolume: 50,
      victoryVolume: 50,
      defeatVolume: 50,
    },
  }),
}));

vi.mock('../../utils/actionSoundsManager', () => ({
  createActionSoundsManager: () => ({
    echoLuckTest: vi.fn(),
  }),
}));

// Mock YouTube API
class MockYTPlayer {
  constructor() {
    this.playVideo = vi.fn();
    this.pauseVideo = vi.fn();
    this.stopVideo = vi.fn();
    this.destroy = vi.fn();
    this.seekTo = vi.fn();
    this.setVolume = vi.fn();
  }
}

global.window.YT = {
  Player: MockYTPlayer,
};

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

describe('App smoke test', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    // Spy on console.error to catch errors
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should render without errors and have a body element', () => {
    const { container } = render(<App />);

    // Check that body element exists in the rendered HTML
    const bodyElement = container.closest('body') || document.body;
    expect(bodyElement).toBeTruthy();

    // Check for no console errors
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});
