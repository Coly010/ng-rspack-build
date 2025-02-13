import { readProjectConfiguration, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { AngularApplicationSchema } from './schema';
import applicationGenerator from './application';

describe('Application Generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should generate an application correctly', async () => {
    // ARRANGE
    const options: AngularApplicationSchema = {
      directory: 'apps/demo',
      e2eTestRunner: 'none',
      skipPackageJson: true,
    };
    // ACT
    await applicationGenerator(tree, options);

    // ASSERT
    const project = readProjectConfiguration(tree, 'demo');
    expect(project.targets?.build).toMatchInlineSnapshot(`
      {
        "configurations": {
          "development": {
            "mode": "development",
          },
          "production": {
            "mode": "production",
          },
        },
        "defaultConfiguration": "production",
        "executor": "@ng-rspack/nx:build",
        "options": {
          "assets": [
            "./public",
          ],
          "index": "./src/index.html",
          "main": "./src/main.ts",
          "outputPath": "../../dist/apps/demo",
          "polyfills": [
            "zone.js",
          ],
          "styles": [
            "./src/styles.css",
          ],
          "tsConfig": "./tsconfig.app.json",
        },
        "outputs": [
          "{options.outputPath}",
        ],
      }
    `);
    expect(project.targets?.serve).toMatchInlineSnapshot(`
      {
        "configurations": {
          "development": {
            "buildTarget": "demo:build:development",
          },
          "production": {
            "buildTarget": "demo:build:production",
          },
        },
        "defaultConfiguration": "development",
        "executor": "@ng-rspack/nx:serve",
        "options": {
          "port": 4200,
        },
      }
    `);
    expect(project.targets?.['serve-static']).toMatchInlineSnapshot(`
      {
        "executor": "@nx/web:file-server",
        "options": {
          "buildTarget": "demo:build",
          "port": 4200,
          "spa": true,
          "staticFilePath": "dist/apps/demo",
        },
      }
    `);
  });
});
