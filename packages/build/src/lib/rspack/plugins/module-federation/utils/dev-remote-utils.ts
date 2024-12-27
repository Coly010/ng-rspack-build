import { join } from 'path';
import { existsSync } from 'fs';
import { ProjectConfiguration } from 'nx/src/config/workspace-json-project-json';

export function validateDevRemotes(
  options: {
    devRemotes: string[];
  },
  workspaceProjects: Record<string, ProjectConfiguration>
): void {
  const invalidDevRemotes =
    options.devRemotes.filter((remote) => workspaceProjects[remote]) ?? [];

  if (invalidDevRemotes.length) {
    throw new Error(
      invalidDevRemotes.length === 1
        ? `Invalid dev remote provided: ${invalidDevRemotes[0]}.`
        : `Invalid dev remotes provided: ${invalidDevRemotes.join(', ')}.`
    );
  }
}

export function getDynamicMfManifestFile(
  project: ProjectConfiguration,
  workspaceRoot: string
): string | undefined {
  // {sourceRoot}/assets/module-federation.manifest.json was the generated
  // path for the manifest file in the past. We now generate the manifest
  // file at {root}/public/module-federation.manifest.json. This check
  // ensures that we can still support the old path for backwards
  // compatibility since old projects may still have the manifest file
  // at the old path.
  return [
    join(workspaceRoot, project.root, 'public/module-federation.manifest.json'),
    join(
      workspaceRoot,
      project.sourceRoot!,
      'assets/module-federation.manifest.json'
    ),
  ].find((path) => existsSync(path));
}
