import { describe, expect } from 'vitest';
import {
  DEFAULT_PLUGIN_ANGULAR_OPTIONS,
  getHasServer,
  normalizeOptions,
  resolveFileReplacements,
} from './normalize-options.ts';
import { vol } from 'memfs';

import { MEMFS_VOLUME } from '@ng-rspack/testing-utils';

describe('resolveFileReplacements', () => {
  it('should work with empty results', () => {
    const root = '/root';

    expect(resolveFileReplacements([], root)).toStrictEqual([]);
  });

  it('should return the given FileReplacement with `replace` and `with` paths starting with given root', () => {
    const file = '../src/lib/../main.ts';
    const root = '/repos/project';

    expect(
      resolveFileReplacements([{ replace: file, with: file }], root)
    ).toStrictEqual([
      {
        replace: '/repos/src/main.ts',
        with: '/repos/src/main.ts',
      },
    ]);
  });

  it('should return the given FileReplacement with `replace` and `with` paths resolved against the given root', () => {
    const file = 'src/main.ts';
    const root = '/root';

    expect(
      resolveFileReplacements([{ replace: file, with: file }], root)
    ).toStrictEqual([
      {
        replace: `${root}/${file}`,
        with: `${root}/${file}`,
      },
    ]);
  });
});

describe('getHasServer', () => {
  beforeEach(() => {
    vol.fromJSON(
      {
        'server.js': 'export default { "server": true }',
        'ssr-entry.js': 'export default { "ssr-entry": true }',
      },
      MEMFS_VOLUME
    );
  });

  it('should return true if both server and ssrEntry files exist', () => {
    const result = getHasServer({
      server: 'server.js',
      ssrEntry: 'ssr-entry.js',
      root: MEMFS_VOLUME,
    });

    expect(result).toBe(true);
  });

  it('should return false if server file is not provides', () => {
    const result = getHasServer({
      ssrEntry: 'ssr-entry.js',
      root: '/project-root',
    });

    expect(result).toBe(false);
  });

  it('should return false if ssrEntry file is not provides', () => {
    const result = getHasServer({
      server: 'server.js',
      root: '/project-root',
    });

    expect(result).toBe(false);
  });

  it('should return false if neither file are not provides', () => {
    const result = getHasServer({
      root: '/project-root',
    });

    expect(result).toBe(false);
  });

  it('should return false if server file does not exist', () => {
    const result = getHasServer({
      server: 'non-existing-server.js',
      ssrEntry: 'ssr-entry.js',
      root: '/project-root',
    });

    expect(result).toBe(false);
  });

  it('should return false if ssrEntry file does not exist', () => {
    const result = getHasServer({
      server: 'server.js',
      ssrEntry: 'non-existing-ssr-entry.js',
      root: '/project-root',
    });

    expect(result).toBe(false);
  });

  it('should return false if neither server nor ssrEntry exists', () => {
    const result = getHasServer({
      server: 'non-existing-server.js',
      ssrEntry: 'non-existing-ssr-entry.js',
      root: '/project-root',
    });

    expect(result).toBe(false);
  });
});

describe('normalizeOptions', () => {
  const defaultOptions = DEFAULT_PLUGIN_ANGULAR_OPTIONS;

  it('should apply default values when no options are provided', () => {
    const result = normalizeOptions();

    expect(result).toStrictEqual(defaultOptions);
  });

  it('should apply default values when empty options are provided', () => {
    const result = normalizeOptions({});

    expect(result).toStrictEqual(defaultOptions);
  });

  it('should apply provides options', () => {
    const result = normalizeOptions({ root: 'project-root' });

    expect(result).toStrictEqual({
      ...defaultOptions,
      root: 'project-root',
    });
  });

  it('should ignore passed hasServer option', () => {
    expect(normalizeOptions({ hasServer: true }).hasServer).toStrictEqual(
      false
    );
  });

  it('should set hasServer option based on provided of server and ssr-entry files', () => {
    vol.fromJSON(
      {
        'server.js': 'export default { "server": true }',
        'ssr-entry.js': 'export default { "ssr-entry": true }',
      },
      MEMFS_VOLUME
    );

    expect(
      normalizeOptions({
        server: 'server.js',
        ssrEntry: 'ssr-entry.js',
        root: MEMFS_VOLUME,
      }).hasServer
    ).toStrictEqual(true);
  });

  it('should resolve the paths of fileReplacements if given', () => {
    const fileReplacements = [
      { replace: 'src/main.ts', with: 'src/main.prod.ts' },
    ];

    const resolvedFileReplacements = normalizeOptions({
      fileReplacements,
      root: MEMFS_VOLUME,
    }).fileReplacements;

    expect(resolvedFileReplacements).toStrictEqual([
      {
        replace: `${MEMFS_VOLUME}/src/main.ts`,
        with: `${MEMFS_VOLUME}/src/main.prod.ts`,
      },
    ]);
  });
});
