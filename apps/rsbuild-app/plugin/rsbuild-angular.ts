import { RsbuildPlugin, RsbuildConfig } from '@rsbuild/core';
import * as compilerCli from '@angular/compiler-cli';
import {
  compile as sassCompile,
  compileString as sassCompileString,
} from 'sass';
import * as ts from 'typescript';
import { join, normalize } from 'path';
import { CompilerHost, NgtscProgram } from '@angular/compiler-cli';
import { createHash } from 'node:crypto';
import { StyleUrlsResolver, TemplateUrlsResolver } from './component-resolvers';
import { SourceFileCache } from './source-file-cache';
import { JavaScriptTransformer } from '@angular/build/private';

const { availableParallelism } = require('node:os');

function isPresent(variable) {
  return typeof variable === 'string' && variable !== '';
}

const maxWorkersVariable = process.env['NG_BUILD_MAX_WORKERS'];
const maxWorkers = isPresent(maxWorkersVariable)
  ? +maxWorkersVariable
  : Math.min(4, Math.max(availableParallelism() - 1, 1));

interface EmitFileResult {
  content?: string;
  map?: string;
  dependencies: readonly string[];
  hash?: Uint8Array;
  errors: (string | ts.DiagnosticMessageChain)[];
  warnings: (string | ts.DiagnosticMessageChain)[];
}

type FileEmitter = (file: string) => EmitFileResult | undefined;

export interface RsbuildAngularOptions {
  root?: string;
}

export const rsbuildAngular = (
  options: RsbuildAngularOptions = {}
): RsbuildPlugin => ({
  name: 'rsbuild-angular',
  setup(api) {
    const TS_EXT_REGEX = /\.[cm]?(ts)[^x]?\??/;
    const JS_EXT_REGEX = /\.[cm]?(js)[^x]?\??/;
    let watchMode = false;
    let nextProgram: NgtscProgram | undefined | ts.Program;
    let builderProgram: ts.EmitAndSemanticDiagnosticsBuilderProgram;
    const styleUrlsResolver = new StyleUrlsResolver();
    const templateUrlsResolver = new TemplateUrlsResolver();
    let fileEmitter: FileEmitter;
    const sourceFileCache = new SourceFileCache();
    const javascriptTransformer = new JavaScriptTransformer(
      {
        sourcemap: false,
        thirdPartySourcemaps: false,
        advancedOptimizations: false,
        jit: false,
      },
      maxWorkers
    );

    const config = api.getRsbuildConfig();

    api.onBeforeStartDevServer(() => {
      watchMode = true;
    });

    api.onBeforeEnvironmentCompile(async (buildOptions) => {
      const { rootNames, compilerOptions, host } = setupCompilation(config);

      // Only store cache if in watch mode
      // Investigate invalidating cache
      // console.log('watchMode', watchMode);
      // if (watchMode) {
      //   augmentHostWithCaching(host, sourceFileCache);
      // }

      fileEmitter = await buildAndAnalyze(
        rootNames,
        host,
        compilerOptions,
        nextProgram,
        builderProgram
      );
    });

    api.transform(
      { test: TS_EXT_REGEX },
      ({ code, resource, addDependency }) => {
        if (resource.includes('.ts?')) {
          // Strip the query string off the ID
          // in case of a dynamically loaded file
          resource = resource.replace(/\?(.*)/, '');
        }

        const templateUrls = templateUrlsResolver.resolve(code, resource);
        const styleUrls = styleUrlsResolver.resolve(code, resource);

        if (watchMode) {
          for (const urlSet of [...templateUrls, ...styleUrls]) {
            // `urlSet` is a string where a relative path is joined with an
            // absolute path using the `|` symbol.
            // For example: `./app.component.html|/home/projects/analog/src/app/app.component.html`.
            const [, absoluteFileUrl] = urlSet.split('|');
            addDependency(absoluteFileUrl);
          }
        }

        const typescriptResult = fileEmitter?.(resource);

        if (
          typescriptResult?.warnings &&
          typescriptResult?.warnings.length > 0
        ) {
          console.warn(`${typescriptResult.warnings.join('\n')}`);
        }

        if (typescriptResult?.errors && typescriptResult?.errors.length > 0) {
          console.error(`${typescriptResult.errors.join('\n')}`);
        }

        // return fileEmitter
        return typescriptResult?.content ?? '';
      }
    );

    api.transform({ test: JS_EXT_REGEX }, ({ code, resource }) => {
      return javascriptTransformer
        .transformData(resource, code, false, false)
        .then((contents) => {
          return { code: Buffer.from(contents).toString('utf8') };
        });
    });

    api.transform({ resourceQuery: /direct/ }, ({ code, resource }) => {
      console.log('transforming direct', resource);
      return sassCompileString(code).css;
    });
    api.transform({ resourceQuery: /scss/ }, ({ code, resource }) => {
      console.log('transforming scss', resource);
      return sassCompileString(code).css;
    });
  },
});

function setupCompilation(config: RsbuildConfig, context?: unknown) {
  const isProd = config.mode === 'production';

  const { options: tsCompilerOptions, rootNames: rn } =
    compilerCli.readConfiguration(config.source.tsconfigPath, {
      suppressOutputPathCheck: true,
      outDir: undefined,
      sourceMap: false,
      inlineSourceMap: !isProd,
      inlineSources: !isProd,
      declaration: false,
      declarationMap: false,
      allowEmptyCodegenFiles: false,
      annotationsAs: 'decorators',
      enableResourceInlining: false,
      noEmitOnError: false,
      mapRoot: undefined,
      sourceRoot: undefined,
      supportTestBed: false,
      supportJitMode: false,
    });

  const compilerOptions = tsCompilerOptions;
  const host = ts.createIncrementalCompilerHost(compilerOptions);

  const styleTransform = (code: string, filename: string) => {
    const result = sassCompileString(code);
    return result.css;
  };

  augmentHostWithResources(host, styleTransform, {
    inlineStylesExtension: 'scss',
    isProd,
  });

  return {
    rootNames: rn,
    compilerOptions,
    host,
  };
}

function augmentHostWithResources(
  host: ts.CompilerHost,
  transform: (
    code: string,
    id: string,
    options?: { ssr?: boolean }
  ) => ReturnType<any> | null,
  options: {
    inlineStylesExtension?: string;
    isProd?: boolean;
  } = {}
) {
  const resourceHost = host as CompilerHost;
  const baseGetSourceFile = (
    resourceHost as ts.CompilerHost
  ).getSourceFile.bind(resourceHost);

  resourceHost.readResource = async function (fileName: string) {
    const filePath = normalize(fileName);

    const content = (this as any).readFile(filePath);

    if (content === undefined) {
      throw new Error('Unable to locate component resource: ' + fileName);
    }

    return content;
  };

  resourceHost.transformResource = async function (data, context) {
    // Only style resources are supported currently
    if (context.type !== 'style') {
      return null;
    }

    if (options.inlineStylesExtension) {
      // Resource file only exists for external stylesheets
      console.log(
        'transforming style',
        context.resourceFile,
        context.containingFile
      );
      const filename =
        context.resourceFile ??
        `${context.containingFile.replace(/\.ts$/, (...args) => {
          return `.${options?.inlineStylesExtension}`;
        })}`;

      let stylesheetResult;

      try {
        stylesheetResult = await transform(data, `${filename}?direct`);
      } catch (e) {
        console.error(`${e}`);
      }

      console.log('stylesheetResult', stylesheetResult);
      return { content: stylesheetResult || '' };
    }

    return null;
  };
}

function augmentProgramWithVersioning(program: ts.Program): void {
  const baseGetSourceFiles = program.getSourceFiles;
  program.getSourceFiles = function (...parameters) {
    const files: readonly (ts.SourceFile & { version?: string })[] =
      baseGetSourceFiles(...parameters);

    for (const file of files) {
      if (file.version === undefined) {
        file.version = createHash('sha256').update(file.text).digest('hex');
      }
    }

    return files;
  };
}

async function buildAndAnalyze(
  rootNames: string[],
  host: ts.CompilerHost,
  compilerOptions: compilerCli.CompilerOptions,
  nextProgram: NgtscProgram | undefined | ts.Program,
  builderProgram: ts.EmitAndSemanticDiagnosticsBuilderProgram
) {
  // Create the Angular specific program that contains the Angular compiler
  const angularProgram: NgtscProgram = new compilerCli.NgtscProgram(
    rootNames,
    compilerOptions,
    host as CompilerHost,
    nextProgram as any
  );
  const angularCompiler = angularProgram.compiler;
  const typeScriptProgram = angularProgram.getTsProgram();
  augmentProgramWithVersioning(typeScriptProgram);

  const builder = (builderProgram =
    ts.createEmitAndSemanticDiagnosticsBuilderProgram(
      typeScriptProgram,
      host,
      builderProgram
    ));

  await angularCompiler.analyzeAsync();

  nextProgram = angularProgram;

  const getTypeChecker = () => builder.getProgram().getTypeChecker();
  const fileEmitter = createFileEmitter(
    builder,
    mergeTransformers({}, angularCompiler!.prepareEmit().transformers),
    () => [],
    angularCompiler!
  );

  return fileEmitter;
}

function createFileEmitter(
  program: ts.BuilderProgram,
  transformers: ts.CustomTransformers = {},
  onAfterEmit?: (sourceFile: ts.SourceFile) => void,
  angularCompiler?: NgtscProgram['compiler']
): FileEmitter {
  return (file: string) => {
    const sourceFile = program.getSourceFile(file);
    if (!sourceFile) {
      return undefined;
    }

    const diagnostics = angularCompiler
      ? angularCompiler.getDiagnosticsForFile(sourceFile, 1)
      : [];

    const errors = diagnostics
      .filter((d) => d.category === ts.DiagnosticCategory?.Error)
      .map((d) => d.messageText);

    const warnings = diagnostics
      .filter((d) => d.category === ts.DiagnosticCategory?.Warning)
      .map((d) => d.messageText);

    let content: string | undefined;
    program.emit(
      sourceFile,
      (filename, data) => {
        if (/\.[cm]?js$/.test(filename)) {
          content = data;
        }
      },
      undefined /* cancellationToken */,
      undefined /* emitOnlyDtsFiles */,
      transformers
    );

    onAfterEmit?.(sourceFile);

    return { content, dependencies: [], errors, warnings };
  };
}

function mergeTransformers(
  first: ts.CustomTransformers,
  second: ts.CustomTransformers
): ts.CustomTransformers {
  const result: ts.CustomTransformers = {};

  if (first.before || second.before) {
    result.before = [...(first.before || []), ...(second.before || [])];
  }

  if (first.after || second.after) {
    result.after = [...(first.after || []), ...(second.after || [])];
  }

  if (first.afterDeclarations || second.afterDeclarations) {
    result.afterDeclarations = [
      ...(first.afterDeclarations || []),
      ...(second.afterDeclarations || []),
    ];
  }

  return result;
}

function augmentHostWithCaching(
  host: ts.CompilerHost,
  cache: Map<string, ts.SourceFile>
): void {
  const baseGetSourceFile = host.getSourceFile;
  host.getSourceFile = function (
    fileName,
    languageVersion,
    onError,
    shouldCreateNewSourceFile,
    ...parameters
  ) {
    if (!shouldCreateNewSourceFile && cache.has(fileName)) {
      return cache.get(fileName);
    }

    const file = baseGetSourceFile.call(
      host,
      fileName,
      languageVersion,
      onError,
      true,
      ...parameters
    );

    if (file) {
      cache.set(fileName, file);
    }

    return file;
  };
}
