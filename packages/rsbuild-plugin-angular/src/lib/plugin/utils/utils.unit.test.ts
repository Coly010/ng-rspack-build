import { describe, expect } from 'vitest';
import { isUsingWindows } from './utils.ts';
import * as osModule from 'node:os';

vi.mock('node:os', async (importOriginal) => {
  const actual = await importOriginal<typeof osModule>();

  return {
    ...actual,
    platform: vi.fn(),
  };
});

describe('isUsingWindows', async () => {
  it('should return true if the platform is win32', () => {
    const platformSpy = vi.spyOn(osModule, 'platform').mockReturnValue('win32');
    expect(isUsingWindows()).toBe(true);
    expect(platformSpy).toHaveBeenCalledTimes(1);
  });

  it.each([
    'aix',
    'android',
    'darwin',
    'freebsd',
    'haiku',
    'linux',
    'openbsd',
    'sunos',
    'cygwin',
    'netbsd',
  ] as const)('should return false if platform is %s', (platform) => {
    const platformSpy = vi
      .spyOn(osModule, 'platform')
      .mockReturnValue(platform);
    expect(isUsingWindows()).toBe(false);
    expect(platformSpy).toHaveBeenCalledTimes(1);
  });
});
