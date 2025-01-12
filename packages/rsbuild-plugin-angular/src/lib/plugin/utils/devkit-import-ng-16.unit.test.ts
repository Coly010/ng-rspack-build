import { describe, expect } from 'vitest';

vi.mock('@angular/compiler-cli', async () => {
  const actual = await vi.importActual('@angular/compiler-cli');
  return {
    ...actual,
    VERSION: {
      major: 16,
      minor: 4,
      patch: 2,
    },
  };
});

describe('devkit importing an angular version >=16 & <18', async () => {
  // @TODO fins a way to mock require calls instead of testing the error
  it('should return the exports', async () => {
    expect(import('./devkit.ts')).rejects.toThrow(
      '@angular-devkit/build-angular/src/tools/esbuild/angular/compiler-plugin.js'
    );
  });
});
