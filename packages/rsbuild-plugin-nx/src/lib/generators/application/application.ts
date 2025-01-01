import { applicationGenerator as angularAppGenerator } from '@nx/angular/generators';
import { AngularApplicationSchema } from './schema';
import {
  addDependenciesToPackageJson,
  ensurePackage,
  formatFiles,
  GeneratorCallback,
  joinPathFragments,
  readJson,
  readProjectConfiguration,
  runTasksInSerial,
  type Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import { determineProjectNameAndRootOptions } from '@nx/devkit/src/generators/project-name-and-root-utils';
import { basename } from 'path/posix';
import {
  ngRsbuildPluginAngularVersion,
  rsbuildVersion,
  sassEmbeddedVersion,
  sassLoaderVersion,
} from '../../utils/versions';

export async function applicationGenerator(
  tree: Tree,
  options: AngularApplicationSchema
) {
  if (!options.directory && !options.name) {
    throw new Error(
      'You must provide a directory where the application will be placed.'
    );
  }
  if (
    (options.directory === '.' || options.directory === './') &&
    !options.name
  ) {
    throw new Error(
      'When placing an application in the current working directory, you must provide a name for the application with --name'
    );
  }

  const tasks: GeneratorCallback[] = [];

  const { projectName, projectRoot } = await determineProjectNameAndRootOptions(
    tree,
    {
      name: options.name ?? basename(options.directory),
      directory: options.directory,
      projectType: 'application',
    }
  );

  const initTask = await angularAppGenerator(tree, {
    ...options,
    name: projectName,
    directory: projectRoot,
    port: options.port ?? 4200,
    projectNameAndRootFormat: 'as-provided',
    style: options.style ?? 'css',
    linter: options.linter ?? 'eslint',
    unitTestRunner: options.unitTestRunner ?? 'jest',
    e2eTestRunner: options.e2eTestRunner ?? 'playwright',
    bundler: 'esbuild',
    addTailwind: false,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
  tasks.push(initTask);

  const project = readProjectConfiguration(tree, projectName);
  delete project.targets!.build;
  delete project.targets!.serve;
  delete project.targets!['extract-i18n'];
  updateProjectConfiguration(tree, projectName, project);

  createRsbuildConfig(tree, projectRoot, options.ssr);
  updateServer(tree, projectRoot);

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  let installTask = () => {};
  if (options.skipPackageJson) {
    installTask = addDependenciesToPackageJson(
      tree,
      {},
      {
        '@ng-rsbuild/plugin-angular': ngRsbuildPluginAngularVersion,
        '@rsbuild/core': rsbuildVersion,
        'sass-loader': sassLoaderVersion,
        'sass-embedded': sassEmbeddedVersion,
      }
    );
  }
  tasks.push(installTask);

  const nxRsbuildPluginTask = await initNxRsbuildPlugin(
    tree,
    options.skipPackageJson ?? false
  );
  tasks.push(nxRsbuildPluginTask);

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  return runTasksInSerial(...tasks);
}

async function initNxRsbuildPlugin(tree: Tree, skipPackageJson: boolean) {
  const packageJsonContents = readJson(tree, 'package.json');
  const nxVersion =
    packageJsonContents?.['devDependencies']?.['nx'] ??
    packageJsonContents?.['dependencies']?.['nx'];

  if (!nxVersion) {
    throw new Error('Nx is not installed. Please install Nx and try again.');
  }

  ensurePackage('@nx/rsbuild', nxVersion);
  const { initGenerator } = await import('@nx/rsbuild/generators');
  return await initGenerator(tree, {
    skipPackageJson: skipPackageJson,
    addPlugin: true,
    skipFormat: true,
  });
}

function createRsbuildConfig(tree: Tree, projectRoot: string, ssr = false) {
  const rsbuildConfigContents = `import { createConfig } from '@ng-rsbuild/plugin-angular';

export default createConfig({
  browser: './src/main.ts',${
    ssr
      ? `
  server: './src/main.server.ts',
  ssrEntry: './src/server.ts',`
      : ''
  }
});
`;

  tree.write(
    joinPathFragments(projectRoot, 'rsbuild.config.ts'),
    rsbuildConfigContents
  );
}

function updateServer(tree: Tree, projectRoot: string) {
  const serverContents = `import { createServer } from '@ng-rsbuild/plugin-angular/ssr';
import bootstrap from './main.server';

const server = createServer(bootstrap);

/** Add your custom server logic here
 *
 * For example, you can add a custom static file server:
 *
 * server.app.use('/static', express.static(staticFolder));
 *
 * Or add additional api routes:
 *
 * server.app.get('/api/hello', (req, res) => {
 *   res.send('Hello World!');
 * });
 *
 * Or add additional middleware:
 *
 * server.app.use((req, res, next) => {
 *   res.send('Hello World!');
 * });
 */

server.listen();
`;

  tree.write(joinPathFragments(projectRoot, 'src/server.ts'), serverContents);
}

export default applicationGenerator;
