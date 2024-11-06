import { Compiler, RspackPluginInstance } from '@rspack/core';
import {
  MappedRemotes,
  ModuleFederationConfig,
  NgRspackModuleFederationConfigOverride,
  SharedDependencies,
  SharedWorkspaceLibraryConfig,
} from '../../types/module-federation';
import { getModuleFederationConfig } from './utils/get-module-federation-config';
import { NgRspackModuleFederationDevServerPlugin } from './ng-rspack-module-federation-dev-server-plugin';

export class NgRspackModuleFederationPlugin implements RspackPluginInstance {
  private sharedLibraries: SharedWorkspaceLibraryConfig | undefined;
  private sharedDependencies: SharedDependencies | undefined;
  private mappedRemotes: MappedRemotes | undefined;

  constructor(
    private _options: ModuleFederationConfig,
    private configOverride?: NgRspackModuleFederationConfigOverride,
    private remoteOptions?: { devRemotes?: string[]; skipRemotes?: string[] }
  ) {}

  apply(compiler: Compiler) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    if (global.NX_GRAPH_CREATION) {
      return;
    }

    // This is required to ensure Module Federation will build the project correctly
    compiler.options.optimization.runtimeChunk = false;

    const isDevServer =
      !!process.env['WEBPACK_SERVE'] && !process.env['NG_RSPACK_INITIAL_HOST'];

    const config = getModuleFederationConfig(this._options);
    this.sharedLibraries = config.sharedLibraries;
    this.sharedDependencies = config.sharedDependencies;
    this.mappedRemotes = config.mappedRemotes;

    new (require('@module-federation/enhanced/rspack').ModuleFederationPlugin)({
      name: this._options.name.replace(/-/g, '_'),
      filename: 'remoteEntry.js',
      exposes: this._options.exposes,
      remotes: this.mappedRemotes,
      shared: {
        ...(this.sharedDependencies ?? {}),
      },
      ...(this.configOverride ? this.configOverride : {}),
      runtimePlugins: this.configOverride
        ? this.configOverride.runtimePlugins ?? []
        : [],
      virtualRuntimeEntry: true,
      library: { type: 'module' },
    }).apply(compiler);

    if (this.sharedLibraries) {
      this.sharedLibraries.getReplacementPlugin().apply(compiler);
    }
    if (isDevServer) {
      process.env['NG_RSPACK_INITIAL_HOST'] = 'set';
      new NgRspackModuleFederationDevServerPlugin({
        moduleFederationConfig: this._options,
        host: 'localhost',
        devRemotes: this.remoteOptions
          ? this.remoteOptions.devRemotes ?? []
          : [],
        skipRemotes: this.remoteOptions
          ? this.remoteOptions.skipRemotes ?? []
          : [],
      }).apply(compiler);
    }
  }
}
