import type {
  WorkspaceLibrary,
  WorkspaceLibrarySecondaryEntryPoint,
} from '../../../types/module-federation';
export declare function collectWorkspaceLibrarySecondaryEntryPoints(
  library: WorkspaceLibrary,
  tsconfigPathAliases: Record<string, string[]>
): WorkspaceLibrarySecondaryEntryPoint[];
export declare function getNonNodeModulesSubDirs(directory: string): string[];
export declare function recursivelyCollectSecondaryEntryPointsFromDirectory(
  pkgName: string,
  pkgVersion: string,
  pkgRoot: string,
  mainEntryPointExports: any | undefined,
  directories: string[],
  collectedPackages: {
    name: string;
    version: string;
  }[]
): void;
export declare function collectPackageSecondaryEntryPoints(
  pkgName: string,
  pkgVersion: string,
  collectedPackages: {
    name: string;
    version: string;
  }[]
): void;
