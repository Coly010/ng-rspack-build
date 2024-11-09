import { describe, it, expect, vi } from 'vitest';
import { NgRspackModuleFederationDevServerPlugin } from './ng-rspack-module-federation-dev-server-plugin';

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
      moduleFederationConfig: {
        name: 'testApp',
        remotes: [],
      },
      devRemotes: ['remote1'],
      skipRemotes: ['skip1'],
      host: 'localhost',
      staticRemotesPort: 3000,
      pathToManifestFile: 'path/to/manifest.json',
      ssl: true,
      sslCert: 'path/to/cert.pem',
      sslKey: 'path/to/key.pem',
      parallel: 3,
    };

    const plugin = new NgRspackModuleFederationDevServerPlugin(options);

    // Assert
    // @ts-expect-error: Accessing private property for testing
    expect(plugin._options).toBeDefined();
    // @ts-expect-error: Accessing private property for testing
    expect(plugin._options).toEqual(options);
    // @ts-expect-error: Accessing private property for testing
    expect(plugin._options.moduleFederationConfig.name).toBe('testApp');
    // @ts-expect-error: Accessing private property for testing
    expect(plugin._options.devRemotes).toEqual(['remote1']);
    // @ts-expect-error: Accessing private property for testing
    expect(plugin._options.skipRemotes).toEqual(['skip1']);
    // @ts-expect-error: Accessing private property for testing
    expect(plugin._options.host).toBe('localhost');
    // @ts-expect-error: Accessing private property for testing
    expect(plugin._options.staticRemotesPort).toBe(3000);
    // @ts-expect-error: Accessing private property for testing
    expect(plugin._options.pathToManifestFile).toBe('path/to/manifest.json');
    // @ts-expect-error: Accessing private property for testing
    expect(plugin._options.ssl).toBe(true);
    // @ts-expect-error: Accessing private property for testing
    expect(plugin._options.sslCert).toBe('path/to/cert.pem');
    // @ts-expect-error: Accessing private property for testing
    expect(plugin._options.sslKey).toBe('path/to/key.pem');
    // @ts-expect-error: Accessing private property for testing
    expect(plugin._options.parallel).toBe(3);
  });
});
