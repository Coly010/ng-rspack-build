import {
  MappedRemotes,
  ModuleFederationConfig,
  SharedLibraryConfig,
  SharedWorkspaceLibraryConfig,
  SharedDependencies,
} from '../../../types/module-federation';
export type ResolvedModuleFederationConfig = {
  sharedLibraries: SharedWorkspaceLibraryConfig;
  sharedDependencies: SharedDependencies;
  mappedRemotes: MappedRemotes;
};
export declare function applyDefaultEagerPackages(
  sharedConfig: Record<string, SharedLibraryConfig>
): void;
export declare const DEFAULT_NPM_PACKAGES_TO_AVOID: string[];
export declare const DEFAULT_ANGULAR_PACKAGES_TO_SHARE: string[];
export declare function getFunctionDeterminateRemoteUrl(
  isServer?: boolean
): (remote: string) => string;
export declare function getModuleFederationConfig(
  config: ModuleFederationConfig,
  options?: {
    isServer: boolean;
    determineRemoteUrl?: (remote: string) => string;
  }
): ResolvedModuleFederationConfig;
