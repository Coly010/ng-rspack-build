import { Plugin } from '@swc/core';

interface JavaScriptTransformerOptions {
  sourcemap: boolean;
  thirdPartySourcemaps: boolean;
  advancedOptimizations: boolean;
  jit: boolean;
}

interface JavaScriptTransformRequest {
  filename: string;
  data: string | Uint8Array;
  sourcemap: boolean;
  thirdPartySourcemaps: boolean;
  advancedOptimizations: boolean;
  skipLinker?: boolean;
  sideEffects?: boolean;
  jit: boolean;
  instrumentForCoverage?: boolean;
}

export class JavaScriptTransformer {
  #commonOptions: Required<JavaScriptTransformerOptions>;
  #fileCacheKeyBase: Uint8Array;
  #textDecoder = new TextDecoder();
  #loadEsmModule = new Function('modulePath', `return import(modulePath);`);
  #needsLinking:
    | typeof import('@angular/compiler-cli/linker').needsLinking
    | undefined;

  constructor(
    options: JavaScriptTransformerOptions
    // private readonly cache?: Cache<Uint8Array>
  ) {
    // Extract options to ensure only the named options are serialized and sent to the worker
    const {
      sourcemap,
      thirdPartySourcemaps = false,
      advancedOptimizations = false,
      jit = false,
    } = options;
    this.#commonOptions = {
      sourcemap,
      thirdPartySourcemaps,
      advancedOptimizations,
      jit,
    };
    this.#fileCacheKeyBase = Buffer.from(
      JSON.stringify(this.#commonOptions),
      'utf-8'
    );
  }

  async transformData(
    filename: string,
    data: string,
    skipLinker: boolean,
    sideEffects?: boolean,
    instrumentForCoverage?: boolean
  ): Promise<Uint8Array> {
    if (
      skipLinker &&
      !this.#commonOptions.advancedOptimizations &&
      !instrumentForCoverage
    ) {
      const keepSourcemap =
        this.#commonOptions.sourcemap &&
        (!!this.#commonOptions.thirdPartySourcemaps ||
          !/[\\/]node_modules[\\/]/.test(filename));

      return Buffer.from(
        keepSourcemap
          ? data
          : data.replace(/^\/\/# sourceMappingURL=[^\r\n]*/gm, ''),
        'utf-8'
      );
    }
  }

  private async transformWithSwc(
    filename: string,
    data: string,
    options: Omit<JavaScriptTransformRequest, 'filename' | 'data'>
  ) {
    const shouldLink =
      !options.skipLinker && (await this.requiresLinking(filename, data));
    const useInputSourcemap =
      options.sourcemap &&
      (!!options.thirdPartySourcemaps ||
        !/[\\/]node_modules[\\/]/.test(filename));

    const plugins: [pluginName: string, options: any][] = [];
    if (options.instrumentForCoverage) {
      plugins.push(['swc-plugin-coverage-instrument', {}]);
    }

    // TODO: revisit this for 3rd party deps - it is not needed for application code
    // if (shouldLink) {
    //   // Lazy load the linker plugin only when linking is required
    //   const linkerPlugin = await createLinkerPlugin(options);
    //   plugins.push(linkerPlugin);
    // }
  }

  private async requiresLinking(
    path: string,
    source: string
  ): Promise<boolean> {
    // @angular/core and @angular/compiler will cause false positives
    // Also, TypeScript files do not require linking
    if (/[\\/]@angular[\\/](?:compiler|core)|\.tsx?$/.test(path)) {
      return false;
    }

    if (!this.#needsLinking) {
      const linkerModule = await this.#loadEsmModule(
        '@angular/compiler-cli/linker'
      );
      this.#needsLinking = linkerModule.needsLinking;
    }

    return this.#needsLinking!(path, source);
  }
}
