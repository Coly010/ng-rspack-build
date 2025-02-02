import { describe, expect } from 'vitest';
import { maxWorkers } from './utils';
import { ENV_NG_BUILD_MAX_WORKERS } from './constants.ts';
import { availableParallelism } from 'node:os';

describe('maxWorkers', () => {
  it('should use the environment variable value when set', () => {
    vi.stubEnv(ENV_NG_BUILD_MAX_WORKERS, '3');
    expect(maxWorkers()).toBe(3);
  });

  it('should use availableParallelism() as fallback for env vars', () => {
    vi.stubEnv(ENV_NG_BUILD_MAX_WORKERS, '');
    expect(availableParallelism()).toBeGreaterThan(4);
    expect(maxWorkers()).toBe(4);
  });
});
