import { ProjectConfiguration } from 'nx/src/config/workspace-json-project-json';
export declare function validateDevRemotes(
  options: {
    devRemotes: string[];
  },
  workspaceProjects: Record<string, ProjectConfiguration>
): void;
export declare function getDynamicMfManifestFile(
  project: ProjectConfiguration,
  workspaceRoot: string
): string | undefined;
