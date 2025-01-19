#!/usr/bin/env ts-node

import { getProjectsWithEslintTarget, lintAllProjects } from './utils';
import { green } from 'ansis';

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
