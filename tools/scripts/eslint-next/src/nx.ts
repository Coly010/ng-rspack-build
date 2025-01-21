import {
  createProjectGraphAsync,
  readProjectsConfigurationFromProjectGraph,
} from '@nx/devkit';
import { join } from 'path';
import { existsSync } from 'node:fs';
import { bold, yellow } from 'ansis';
import { ProjectConfiguration } from 'nx/src/config/workspace-json-project-json';

export function getEslintConfigPath(project: ProjectConfiguration) {
  return (
    project.targets?.lint.options?.eslintConfig ??
    [
      ...['cjs', 'mjs', 'js'].map((ext) =>
        join(project.root, `eslint.config.${ext}`)
      ),
    ].find((file) => existsSync(file))
  );
}

export async function getProjectsWithEslintTarget(projects?: string[]) {
  const graph = await createProjectGraphAsync({ exitOnError: true });
  return Object.values(
    readProjectsConfigurationFromProjectGraph(graph).projects
  )
    .filter((project) => 'lint' in (project.targets ?? {}))
    .filter((project) => {
      if (Array.isArray(projects) && projects.length >= 0) {
        return projects.some((name) => name === project.name);
      }
      return true;
    })
    .filter((project) => {
      const optEslintConfig = project.targets?.lint.options?.eslintConfig;
      const potentialEslintCinfig = [
        ...(optEslintConfig ? [optEslintConfig] : []),
        ...['cjs', 'mjs', 'js'].map((ext) =>
          join(project.root, `eslint.config.${ext}`)
        ),
      ];

      try {
        const hasEslintConfig: boolean = potentialEslintCinfig.some((file) =>
          existsSync(file)
        );
        if (hasEslintConfig === false) {
          console.log(
            yellow(
              `  • 'Skipping project ${bold(
                project.name
              )} because it does not have an eslintConfig even if the target exists`
            )
          );
        }
        return hasEslintConfig;
      } catch (e) {
        console.log(
          yellow(
            `  • 'Skipping project ${bold(
              project.name
            )} loading because of eslintConfig error: ${e}`
          )
        );
        return false;
      }
    })
    .sort((a, b) => a.root.localeCompare(b.root));
}
