#!/usr/bin/env ts-node

import { getProjectsWithEslintTarget } from './src/nx';
import { gray, green } from 'ansis';
import { lintAllProjects } from './index';
import { mdRuleSummary, printRuleSummary } from './src/utils';

(async () => {
  const searchParams = new URLSearchParams(process.argv.slice(2).join('&'));
  const projectFilter = Array.from(searchParams.getAll('--projects'));
  const reportRequested = searchParams.get('--report') != null;

  console.log(gray(`Collecting projects to migrate to eslint next...\n`));
  const projects = await getProjectsWithEslintTarget(
    projectFilter.length > 0 ? projectFilter : undefined
  );

  if (projects.length <= 0) {
    console.log(green(`No projects with lint targets found. Exiting...`));
    return;
  }
  console.log(
    green(
      `Starting lint process for ${projects.length} projects with lint targets...`
    )
  );

  const allResults = await lintAllProjects(projects);

  if (reportRequested) {
    printRuleSummary(allResults);
    await mdRuleSummary(allResults);
  }

  console.log(green(`All projects processed successfully.`));
})();
