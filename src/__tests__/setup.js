import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Suppress Bootstrap tooltip errors in test environment
// These occur because Bootstrap tries to access DOM properties that don't exist in jsdom
const originalError = window.Error;
const originalOnError = window.onerror;
const originalOnUnhandledRejection = window.onunhandledrejection;

// Suppress specific Bootstrap errors
window.addEventListener('error', (event) => {
  if (
    event.error &&
    event.error.message &&
    (event.error.message.includes(
      'Cannot convert undefined or null to object'
    ) ||
      event.error.message.includes('_isWithActiveTrigger') ||
      (event.error.stack && event.error.stack.includes('bootstrap')))
  ) {
    event.preventDefault();
    event.stopPropagation();
    return true;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  if (
    event.reason &&
    event.reason.message &&
    (event.reason.message.includes(
      'Cannot convert undefined or null to object'
    ) ||
      event.reason.message.includes('_isWithActiveTrigger') ||
      (event.reason.stack && event.reason.stack.includes('bootstrap')))
  ) {
    event.preventDefault();
    return true;
  }
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});
