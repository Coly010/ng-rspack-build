import type { ProjectGraph } from '@nx/devkit';
import { WorkspaceLibrary } from '../../../types/module-federation';
export declare function getDependentPackagesForProject(
  projectGraph: ProjectGraph,
  name: string
): {
  workspaceLibraries: WorkspaceLibrary[];
  npmPackages: string[];
};
