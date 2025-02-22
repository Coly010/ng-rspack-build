import { readProjectConfiguration, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { AngularApplicationSchema } from './schema';
import applicationGenerator from './application';
import { describe, it, expect, beforeEach } from 'vitest';

describe('Application Generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should throw if the directory and name is not present in the options', async () => {
    await expect(() => applicationGenerator(tree, {} as any)).rejects.toThrow(
      'You must provide a directory where the application will be placed.'
    );
  });

  it('should throw if the directory is the current working directory and name is not present in the options', async () => {
    await expect(() =>
      applicationGenerator(tree, { directory: '.' } as any)
    ).rejects.toThrow(
      'When placing an application in the current working directory, you must provide a name for the application with --name'
    );
  });

  it.todo('should generate an application correctly', async () => {
    const options: AngularApplicationSchema = {
      directory: 'apps/demo',
      e2eTestRunner: 'none',
      skipPackageJson: true,
    };

    // @TODO applicationGenerator should not throw
    await expect(applicationGenerator(tree, options)).resolves.not.toThrow();

    const project = readProjectConfiguration(tree, 'demo');
    expect(project.targets?.build).toStrictEqual({
      configurations: {
        development: {
          mode: 'development',
        },
        production: {
          mode: 'production',
        },
      },
      defaultConfiguration: 'production',
      executor: '@ng-rspack/nx:build',
      options: {
        assets: ['./public'],
        index: './src/index.html',
        main: './src/main.ts',
        outputPath: '../../dist/apps/demo',
        polyfills: ['zone.js'],
        styles: ['./src/styles.css'],
        tsConfig: './tsconfig.app.json',
      },
      outputs: ['{options.outputPath}'],
    });
    expect(project.targets?.serve).toStrictEqual({
      configurations: {
        development: {
          buildTarget: 'demo:build:development',
        },
        production: {
          buildTarget: 'demo:build:production',
        },
      },
      defaultConfiguration: 'development',
      executor: '@ng-rspack/nx:serve',
      options: {
        port: 4200,
      },
    });
    expect(project.targets?.['serve-static']).toStrictEqual({
      executor: '@nx/web:file-server',
      options: {
        buildTarget: 'demo:build',
        port: 4200,
        spa: true,
        staticFilePath: 'dist/apps/demo',
      },
    });
  });
});
