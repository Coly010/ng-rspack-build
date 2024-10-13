import { dirname, join } from 'path';
import { mkdirSync, rmSync } from 'fs';
import { execSync } from 'child_process';
import { tmpdir } from 'os';

let projectDirectory = '';

export function getProjectDirectory() {
  return projectDirectory;
}

export function createTestProject() {
  const projectName = 'test-project';
  projectDirectory = join(tmpdir(), 'tmp', projectName);

  // Ensure projectDirectory is empty
  rmSync(projectDirectory, {
    recursive: true,
    force: true,
  });
  mkdirSync(dirname(projectDirectory), {
    recursive: true,
  });

  console.log(`Creating test project in "${projectDirectory}"`);
  execSync(
    `npx --yes create-nx-workspace@latest ${projectName} --preset apps --nxCloud=skip --no-interactive`,
    {
      cwd: dirname(projectDirectory),
      stdio: 'pipe',
      env: process.env,
    }
  );
  console.log(`Created test project in "${projectDirectory}"`);
  execSync(`npm install @ng-rspack/nx@e2e`, {
    cwd: projectDirectory,
    stdio: 'pipe',
    env: process.env,
  });
  console.log(`Installed @ng-rspack/nx@e2e`);
  return projectDirectory;
}

export function cleanup() {
  rmSync(projectDirectory, {
    recursive: true,
    force: true,
  });
}

export function uniq(name: string) {
  const randomFiveDigitNumber = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(5, '0');
  return `${name}${randomFiveDigitNumber}`;
}
