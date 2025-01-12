import {
  readJson,
  readProjectConfiguration,
  Tree,
  workspaceRoot,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { AngularApplicationSchema } from './schema';
import applicationGenerator from './application';
import { vi } from 'vitest';

vi.mock('@nx/devkit', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@nx/devkit')>()),
  createProjectGraphAsync: async () => {
    return {
      nodes: {},
      dependencies: {},
    };
  },
}));

vi.mock('@nx/rsbuild/generators', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@nx/rsbuild/generators')>()),
  initGenerator: async (tree: Tree) => {
    tree.write(
      'nx.json',
      JSON.stringify({
        plugins: [
          {
            plugin: '@nx/rsbuild',
            options: {
              buildTargetName: 'build',
              devTargetName: 'dev',
              previewTargetName: 'preview',
              inspectTargetName: 'inspect',
              typecheckTargetName: 'typecheck',
            },
          },
        ],
      })
    );
    return () => {
      // do nothing
    };
  },
}));

describe.skip('Application Generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    tree.root = workspaceRoot;
    tree.write('nx.json', JSON.stringify({ plugins: [] }));
    const pkgJson = readJson(tree, 'package.json') ?? {};
    tree.write(
      'package.json',
      JSON.stringify({
        ...pkgJson,
        devDependencies: {
          ...(pkgJson.devDependencies ?? undefined),
          nx: '20.3.0',
        },
      })
    );
  });

  it('should generate a CSR application correctly', async () => {
    // ARRANGE
    const options: AngularApplicationSchema = {
      directory: 'apps/demo',
      e2eTestRunner: 'none',
      skipPackageJson: true,
    };
    // ACT
    await applicationGenerator(tree, options);

    // ASSERT
    const nxJson = readJson(tree, 'nx.json');
    expect(nxJson.plugins).toMatchInlineSnapshot(`
      [
        {
          "options": {
            "buildTargetName": "build",
            "devTargetName": "dev",
            "inspectTargetName": "inspect",
            "previewTargetName": "preview",
            "typecheckTargetName": "typecheck",
          },
          "plugin": "@nx/rsbuild",
        },
      ]
    `);

    const project = readProjectConfiguration(tree, 'demo');
    expect(project.targets?.build).not.toBeDefined();
    expect(project.targets?.serve).not.toBeDefined();
    expect(project.targets?.['serve-static']).toMatchInlineSnapshot(`
      {
        "executor": "@nx/web:file-server",
        "options": {
          "buildTarget": "demo:build",
          "port": 4200,
          "spa": true,
          "staticFilePath": "dist/apps/demo/browser",
        },
      }
    `);
    expect(tree.read('apps/demo/rsbuild.config.ts', 'utf-8'))
      .toMatchInlineSnapshot(`
      "import { createConfig } from '@ng-rsbuild/plugin-angular';

      export default createConfig({
        browser: './src/main.ts',
      });
      "
    `);
  });

  it('should generate a SSR application correctly', async () => {
    // ARRANGE
    const options: AngularApplicationSchema = {
      directory: 'apps/demo',
      e2eTestRunner: 'none',
      skipPackageJson: true,
      ssr: true,
    };
    // ACT
    await applicationGenerator(tree, options);

    // ASSERT
    const nxJson = readJson(tree, 'nx.json');
    expect(nxJson.plugins).toMatchInlineSnapshot(`
      [
        {
          "options": {
            "buildTargetName": "build",
            "devTargetName": "dev",
            "inspectTargetName": "inspect",
            "previewTargetName": "preview",
            "typecheckTargetName": "typecheck",
          },
          "plugin": "@nx/rsbuild",
        },
      ]
    `);

    const project = readProjectConfiguration(tree, 'demo');
    expect(project.targets?.build).not.toBeDefined();
    expect(project.targets?.serve).not.toBeDefined();
    expect(tree.read('apps/demo/rsbuild.config.ts', 'utf-8'))
      .toMatchInlineSnapshot(`
      "import { createConfig } from '@ng-rsbuild/plugin-angular';

      export default createConfig({
        browser: './src/main.ts',
        server: './src/main.server.ts',
        ssrEntry: './src/server.ts',
      });
      "
    `);
    expect(tree.read('apps/demo/src/main.server.ts', 'utf-8'))
      .toMatchInlineSnapshot(`
      "import { bootstrapApplication } from '@angular/platform-browser';
      import { AppComponent } from './app/app.component';
      import { config } from './app/app.config.server';

      const bootstrap = () => bootstrapApplication(AppComponent, config);

      export default bootstrap;
      "
    `);
    expect(tree.read('apps/demo/src/server.ts', 'utf-8'))
      .toMatchInlineSnapshot(`
      "import { createServer } from '@ng-rsbuild/plugin-angular/ssr';
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
      "
    `);
  });
});
