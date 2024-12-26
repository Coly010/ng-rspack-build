import { describe, it, expect, vi } from 'vitest';
import { NgRspackModuleFederationPlugin } from './ng-rspack-module-federation-plugin';

// Mock dependencies
vi.mock('nx/src/project-graph/project-graph', () => ({
  readCachedProjectGraph: vi.fn(() => ({
    nodes: {
      testApp: {
        data: {
          targets: {
            build: {
              options: {
                outputPath: 'dist/apps/test-app',
              },
            },
            serve: {
              options: {
                port: 4200,
              },
            },
          },
        },
      },
    },
  })),
  readProjectsConfigurationFromProjectGraph: vi.fn(() => ({
    projects: {
      testApp: {
        name: 'testApp',
      },
    },
  })),
}));

vi.mock('fs', () => ({
  existsSync: vi.fn(() => true),
  readFileSync: vi.fn(),
  cpSync: vi.fn(),
  createWriteStream: vi.fn(),
}));

describe('NgRspackModuleFederationDevServerPlugin', () => {
  it('should initialize with provided options', () => {
    const options = {
      name: 'testApp',
      remotes: [],
    };
    const plugin = new NgRspackModuleFederationPlugin(options);

    // Assert
    // @ts-expect-error: Accessing private property for testing
    expect(plugin._options).toBeDefined();
    // @ts-expect-error: Accessing private property for testing
    expect(plugin._options).toEqual(options);
    // @ts-expect-error: Accessing private property for testing
    expect(plugin._options.name).toBe('testApp');
  });
});
