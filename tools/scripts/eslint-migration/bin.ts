#!/usr/bin/env ts-node

import { getProjectsWithEslintTarget } from './utils/nx';
import { gray, green } from 'ansis';
import { lintAllProjects } from './index';

(async () => {
  const projectFilter = process.argv
    .filter((arg) => arg.startsWith('--projects='))
    .map((arg) => arg.split('=')[1]);

  console.log(gray(`Collecting projects to migrate to eslint next...\n`));
  const projects = await getProjectsWithEslintTarget(
    projectFilter.length > 0 ? projectFilter : undefined
  );

  if (projects.length <= 0) {
    console.log(green(`No projects with lint targets found. Exiting...\n`));
    return;
  }
  console.log(
    green(
      `Starting lint process for ${projects.length} projects with lint targets...\n`
    )
  );

  await lintAllProjects(projects);

  console.log(green(`\nAll projects processed successfully.`));
})();
