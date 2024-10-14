import type { moduleFederationPlugin } from '@module-federation/sdk';
import { NormalModuleReplacementPlugin } from '@rspack/core';

export type WorkspaceLibrary = {
  name: string;
  root: string;
  importKey: string | undefined;
};
export type WorkspaceLibrarySecondaryEntryPoint = {
  name: string;
  path: string;
};
export type ModuleFederationLibrary = { type: string; name: string };
export type Remotes = Array<string | [remoteName: string, remoteUrl: string]>;
export type MappedRemotes = Record<string, string>;
export type SharedDependencies = {
  [p: string]: SharedLibraryConfig;
};

export interface SharedLibraryConfig {
  singleton?: boolean;
  strictVersion?: boolean;
  requiredVersion?: false | string;
  eager?: boolean;
}

export type SharedWorkspaceLibraryConfig = {
  getAliases: () => Record<string, string>;
  getLibraries: (
    projectRoot: string,
    eager?: boolean
  ) => Record<string, SharedLibraryConfig>;
  getReplacementPlugin: () => NormalModuleReplacementPlugin;
};

export type SharedFunction = (
  libraryName: string,
  sharedConfig: SharedLibraryConfig
) => undefined | false | SharedLibraryConfig;

export type AdditionalSharedConfig = Array<
  | string
  | [libraryName: string, sharedConfig: SharedLibraryConfig]
  | { libraryName: string; sharedConfig: SharedLibraryConfig }
>;

export interface ModuleFederationConfig {
  name: string;
  remotes?: Remotes;
  library?: ModuleFederationLibrary;
  exposes?: Record<string, string>;
  shared?: SharedFunction;
  additionalShared?: AdditionalSharedConfig;
  /**
   * `nxRuntimeLibraryControlPlugin` is a runtime module federation plugin to ensure
   * that shared libraries are resolved from a remote with live reload capabilities.
   * If you run into any issues with loading shared libraries, try disabling this option.
   */
  disableNxRuntimeLibraryControlPlugin?: boolean;
}

export type NgRspackModuleFederationConfigOverride = Omit<
  moduleFederationPlugin.ModuleFederationPluginOptions,
  'exposes' | 'remotes' | 'name' | 'library' | 'shared' | 'filename'
>;
