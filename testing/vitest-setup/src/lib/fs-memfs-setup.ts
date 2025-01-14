import {
  MockInstance,
  afterEach,
  beforeEach,
  vi,
  beforeAll,
  afterAll,
} from 'vitest';
import { MEMFS_VOLUME } from '@ng-rspack/testing-utils';

/**
 * Mocks the fs and fs/promises modules with memfs.
 */

type Memfs = typeof import('memfs');

vi.mock('fs', async () => {
  const memfs: Memfs = await vi.importActual('memfs');
  return memfs.fs;
});

vi.mock('fs/promises', async () => {
  const memfs: Memfs = await vi.importActual('memfs');
  return memfs.fs.promises;
});

/**
 * Mocks the current working directory to MEMFS_VOLUME.
 * This is useful when you use relative paths in your code
 * @type {MockInstance<[], string>}
 *
 * @example
 * - `readFile('./file.txt')` reads MEMFS_VOLUME/file.txt
 * - `readFile(join(process.cwd(), 'file.txt'))` reads MEMFS_VOLUME/file.txt
 * - `readFile('file.txt')` reads file.txt
 */
let cwdSpy: MockInstance<[], string>;

// This covers arrange blocks at the top of a "describe" block
beforeAll(() => {
  cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(MEMFS_VOLUME);
});

// Restores mocks usage data in arrange blocks as well as usage of the API in each "it" block.
beforeEach(() => {
  cwdSpy.mockRestore();
});

// Restores mocks usage data "it" block
afterEach(() => {
  cwdSpy.mockRestore();
});

// Restores the original implementation after all "describe" block in a file
afterAll(() => {
  cwdSpy.mockReset();
});
