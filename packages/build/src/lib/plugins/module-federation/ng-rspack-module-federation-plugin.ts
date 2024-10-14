import { Compiler, RspackPluginInstance } from '@rspack/core';
import {
  MappedRemotes,
  ModuleFederationConfig,
  NgRspackModuleFederationConfigOverride,
  SharedDependencies,
  SharedWorkspaceLibraryConfig,
} from '../../types/module-federation';
import { getModuleFederationConfig } from './utils/get-module-federation-config';

export class NgRspackModuleFederationPlugin implements RspackPluginInstance {
  private sharedLibraries: SharedWorkspaceLibraryConfig | undefined;
  private sharedDependencies: SharedDependencies | undefined;
  private mappedRemotes: MappedRemotes | undefined;

  constructor(
    private options: ModuleFederationConfig,
    private configOverride?: NgRspackModuleFederationConfigOverride
  ) {}

  apply(compiler: Compiler) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    if (global.NX_GRAPH_CREATION) {
      return;
    }

    const config = getModuleFederationConfig(this.options);
    this.sharedLibraries = config.sharedLibraries;
    this.sharedDependencies = config.sharedDependencies;
    this.mappedRemotes = config.mappedRemotes;

    new (require('@module-federation/enhanced/rspack').ModuleFederationPlugin)({
      name: this.options.name.replace(/-/g, '_'),
      filename: 'remoteEntry.js',
      exposes: this.options.exposes,
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
  }
}
