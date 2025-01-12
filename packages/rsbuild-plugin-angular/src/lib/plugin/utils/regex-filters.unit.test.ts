import { describe, expect } from 'vitest';
import { JS_EXT_REGEX, TS_EXT_REGEX } from './regex-filters';

describe('TS_EXT_REGEX', () => {
  it.each([
    ['file.ts'],
    ['file.cts'],
    ['file.mts'],
    ['file.tsx'],
    ['file.ts?query'],
  ])('should match .ts files', (filename) => {
    expect(filename).toMatch(TS_EXT_REGEX);
  });

  it.each([['file.js'], ['file.cjs'], ['file.mjs'], ['file']])(
    'should not match other files',
    (filename) => {
      expect(filename).not.toMatch(TS_EXT_REGEX);
    }
  );
});

describe('JS_EXT_REGEX', () => {
  it.each([
    ['file.js'],
    ['file.cjs'],
    ['file.mjs'],
    ['file.jsx'],
    ['file.js?query'],
  ])('should match .ts files', (filename) => {
    expect(filename).toMatch(JS_EXT_REGEX);
  });

  it.each([['file.tsx'], ['file.ts'], ['file.cts'], ['file.mts'], ['file']])(
    'should not match other files',
    (filename) => {
      expect(filename).not.toMatch(JS_EXT_REGEX);
    }
  );
});
