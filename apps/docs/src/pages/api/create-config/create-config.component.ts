import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import {
  ApiOption,
  ApiOptionComponent,
} from '../../../ui/api/api-option.component';
import { CodeBlockComponent } from '../../../ui/code-block/code-block.component';

@Component({
  imports: [MatTabsModule, ApiOptionComponent, CodeBlockComponent],
  preserveWhitespaces: true,
  selector: 'app-create-config',
  templateUrl: './create-config.component.html',
  styleUrls: ['./create-config.component.scss'],
})
export class CreateConfigComponent {
  options: ApiOption[] = [
    {
      name: 'root',
      type: 'string',
      description:
        'The root directory of the project. This is the directory where the `rsbuild.config.ts` file is located.',
    },
    {
      name: 'index',
      type: 'string',
      description:
        'The path to the `index.html` file. This is used to determine the base html template to use.',
    },
    {
      name: 'browser',
      type: 'string',
      description:
        'The path to the browser entry file. This is used to determine the entry point for the browser build. It is usually `./src/main.ts`',
    },
    {
      name: 'server',
      type: 'string',
      description:
        'The path to the server entry file. This is used to determine the entry point for the server build. It is usually `./src/main.server.ts`',
    },
    {
      name: 'ssrEntry',
      type: 'string',
      description:
        'The path to the node server entry file. This contains the express server setup. It is usually `./src/server.ts`',
    },
    {
      name: 'polyfills',
      type: 'Array<string>',
      description:
        'An array of polyfills to include in the build. Can be either a path to a polyfill file or a package name.',
    },
    {
      name: 'assets',
      type: 'Array<string>',
      description:
        'An array of assets to include in the build. Can be a path to a directory or a file. Resolved from the path provided in `root`.',
    },
    {
      name: 'styles',
      type: 'Array<string>',
      description:
        'An array of styles to include in the build. Resolved from the path provided in `root`.',
    },
    {
      name: 'scripts',
      type: 'Array<string>',
      description:
        'An array of scripts to include in the build. Resolved from the path provided in `root`.',
    },
    {
      name: 'fileReplacements',
      type: 'Array<FileReplacement>',
      description:
        'An array of file replacements to be used in the build. This is used to replace files during the build process.',
    },
    {
      name: 'jit',
      type: 'boolean',
      description:
        'A boolean value indicating whether to use the JIT mode. This is used to tell the Angular compiler to use Just-In-Time Compilation. **Not Recommended**',
      default: 'false',
    },
    {
      name: 'inlineStylesExtension',
      type: "'css' | 'scss' | 'sass'",
      description:
        'The inline styles extension to use. This is used to inform the compiler how to handle inline styles, setting up Sass compilation if required.',
    },
    {
      name: 'tsconfigPath',
      type: 'string',
      description:
        'The path to the TypeScript configuration file. This is used to set `compilerOptions` for the Angular compilation.',
      default: './tsconfig.app.json',
    },
    {
      name: 'hasServer',
      type: 'boolean',
      description:
        'A boolean value indicating whether the project has a server. This is inferred based on the presence of `ssrEntry` and `server` and does not need to be set manually.',
      internal: true,
    },
    {
      name: 'useParallelCompilation',
      type: 'boolean',
      description:
        'A boolean value indicating whether to use parallel compilation. Parallel compilation uses workers to speed up the compilation process.',
      default: 'true',
    },
    {
      name: 'useHoistedJavascriptProcessing',
      type: 'boolean',
      description:
        'Hoisted javascript processing is a technique used to improve build speeds by moving processing of the `JavaScriptTransformer` to a separate plugin in order to share cache between server and browser builds.',
      default: 'true',
    },
  ];
}
