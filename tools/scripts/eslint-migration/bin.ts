#!/usr/bin/env ts-node

import { getProjectsWithEslintTarget } from './utils/nx';
import { green } from 'ansis';
import { lintAllProjects } from './index';

(async () => {
  const projects = await getProjectsWithEslintTarget();
  console.log(
    green(
      `Starting lint process for ${projects.length} projects with lint targets...\n`
    )
  );

  await lintAllProjects(projects);

  console.log(green(`\nAll projects processed successfully.`));
})();
