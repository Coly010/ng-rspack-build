import { applicationGenerator as angularAppGenerator } from '@nx/angular/generators';
import { AngularApplicationSchema } from './schema';
import {
  addDependenciesToPackageJson,
  formatFiles,
  joinPathFragments,
  offsetFromRoot,
  readProjectConfiguration,
  runTasksInSerial,
  type Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import { determineProjectNameAndRootOptions } from '@nx/devkit/src/generators/project-name-and-root-utils';
import { basename, relative, resolve } from 'path/posix';
import {
  ngRspackBuildVersion,
  sassEmbeddedVersion,
  sassLoaderVersion,
  sassVersion,
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
    ssr: false,
    addTailwind: false,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  const projectOffsetFromRoot = offsetFromRoot(projectRoot);
  const project = readProjectConfiguration(tree, projectName);
  const buildOptions = project.targets!.build;
  buildOptions.executor = '@ng-rspack/nx:build';
  const originalOutputPath = buildOptions.options.outputPath;
  buildOptions.options.outputPath = joinPathFragments(
    projectOffsetFromRoot,
    buildOptions.options.outputPath
  );
  buildOptions.options.index = makePathRelativeToProjectRoot(
    buildOptions.options.index,
    projectRoot
  );
  buildOptions.options.main = makePathRelativeToProjectRoot(
    buildOptions.options.browser,
    projectRoot
  );
  delete buildOptions.options.browser;
  buildOptions.options.tsConfig = makePathRelativeToProjectRoot(
    buildOptions.options.tsConfig,
    projectRoot
  );
  buildOptions.options.assets = buildOptions.options.assets.map((asset) =>
    makePathRelativeToProjectRoot(asset.input, projectRoot)
  );
  buildOptions.options.styles = buildOptions.options.styles.map((style) =>
    makePathRelativeToProjectRoot(style, projectRoot)
  );
  delete buildOptions.options.scripts;
  buildOptions.configurations = {
    production: {
      mode: 'production',
    },
    development: {
      mode: 'development',
    },
  };

  const serveOptions = project.targets!.serve;
  serveOptions.executor = '@ng-rspack/nx:serve';
  serveOptions.options = { port: options.port ?? 4200 };

  const serveStaticOptions = project.targets!['serve-static'];
  serveStaticOptions.options.staticFilePath = originalOutputPath;

  updateProjectConfiguration(tree, projectName, project);

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  let installTask = () => {};
  if (options.skipPackageJson) {
    installTask = addDependenciesToPackageJson(
      tree,
      {},
      {
        '@ng-rspack/build': ngRspackBuildVersion,
        sass: sassVersion,
        'sass-loader': sassLoaderVersion,
        'sass-embedded': sassEmbeddedVersion,
      }
    );
  }
  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  return runTasksInSerial(initTask, installTask);
}

function makePathRelativeToProjectRoot(pathToReplace, projectRoot) {
  // Resolve paths to absolute to avoid issues with relative paths
  const absoluteBasePath = resolve(projectRoot);
  const absoluteFilePath = resolve(pathToReplace);

  // Get the relative path from basePath to filePath
  const relativePath = relative(absoluteBasePath, absoluteFilePath);

  // If the relative path starts with '..', that means the file is outside the basePath
  if (!relativePath.startsWith('..')) {
    // Prepend './' if the relative path doesn't already start with it
    return `./${relativePath}`;
  }

  // If it's not inside the basePath, return the original path
  return pathToReplace;
}

export default applicationGenerator;
