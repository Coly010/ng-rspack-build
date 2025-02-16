import { describe, expect, it } from 'vitest';
import { makePathRelativeToProjectRoot } from './utils';

describe('makePathRelativeToProjectRoot', () => {
  it('should return the original path if pathToReplace is not inside the basePath', () => {
    const pathToReplace = 'projects/angular-lib/src/replace';
    expect(
      makePathRelativeToProjectRoot(pathToReplace, 'projects/angular-app')
    ).toBe(pathToReplace);
  });

  it('should return path with prepend "./" if the file is outside the basePath', () => {
    const pathToReplace = 'projects/angular-app/src/replace';
    expect(
      makePathRelativeToProjectRoot(pathToReplace, 'projects/angular-app')
    ).toBe('./src/replace');
  });
});
