import { Compiler, RspackPluginInstance } from '@rspack/core';
import {
  ModuleFederationConfig,
  StaticRemotesConfig,
} from '../../types/module-federation';
import { ProjectGraph } from '@nx/devkit';
export declare class NgRspackModuleFederationDevServerPlugin
  implements RspackPluginInstance
{
  private _options;
  private nxBin;
  constructor(_options: {
    moduleFederationConfig: ModuleFederationConfig;
    devRemotes: string[];
    skipRemotes: string[];
    host: string;
    staticRemotesPort?: number;
    pathToManifestFile?: string;
    ssl?: boolean;
    sslCert?: string;
    sslKey?: string;
    parallel?: number;
  });
  apply(compiler: Compiler): void;
  private setup;
  parseStaticRemotesConfig(
    staticRemotes: string[] | undefined,
    projectGraph: ProjectGraph
  ): StaticRemotesConfig;
  buildStaticRemotes(
    staticRemotesConfig: StaticRemotesConfig
  ): Promise<Record<string, string> | undefined>;
  private startRemotes;
  private startStaticRemotesFileServer;
  private startRemoteProxies;
}
