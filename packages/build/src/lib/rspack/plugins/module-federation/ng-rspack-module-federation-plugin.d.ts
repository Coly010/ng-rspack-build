import { Compiler, RspackPluginInstance } from '@rspack/core';
import {
  ModuleFederationConfig,
  NgRspackModuleFederationConfigOverride,
} from '../../types/module-federation';
export declare class NgRspackModuleFederationPlugin
  implements RspackPluginInstance
{
  private _options;
  private configOverride?;
  private remoteOptions?;
  private sharedLibraries;
  private sharedDependencies;
  private mappedRemotes;
  constructor(
    _options: ModuleFederationConfig,
    configOverride?: NgRspackModuleFederationConfigOverride | undefined,
    remoteOptions?:
      | {
          devRemotes?: string[];
          skipRemotes?: string[];
        }
      | undefined
  );
  apply(compiler: Compiler): void;
}
