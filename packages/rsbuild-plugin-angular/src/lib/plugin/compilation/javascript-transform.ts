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
  #loadEsmModule = new Function('modulePath', `return import(modulePath);`);
  #needsLinking:
    | typeof import('@angular/compiler-cli/linker').needsLinking
    | undefined;

  constructor(options: JavaScriptTransformerOptions) {
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
  }

  async transformData(
    filename: string,
    data: string,
    skipLinker: boolean,
    sideEffects?: boolean,
    instrumentForCoverage?: boolean
  ): Promise<string> {
    if (
      skipLinker &&
      !this.#commonOptions.advancedOptimizations &&
      !instrumentForCoverage
    ) {
      const keepSourcemap =
        this.#commonOptions.sourcemap &&
        (!!this.#commonOptions.thirdPartySourcemaps ||
          !/[\\/]node_modules[\\/]/.test(filename));

      return (
        keepSourcemap
          ? data
          : data.replace(/^\/\/# sourceMappingURL=[^\r\n]*/gm, ''),
        'utf-8'
      );
    }

    return this.transformWithSwc(filename, data, {
      skipLinker,
      sideEffects,
      instrumentForCoverage,
      ...this.#commonOptions,
    });
  }

  private async transformWithSwc(
    filename: string,
    data: string,
    options: Omit<JavaScriptTransformRequest, 'filename' | 'data'>
  ) {
    const shouldLink =
      !options.skipLinker && (await this.requiresLinking(filename, data));

    // TODO: revisit this for 3rd party deps - it is not needed for application code
    // if (shouldLink) {
    //   // Lazy load the linker plugin only when linking is required
    //   const linkerPlugin = await createLinkerPlugin(options);
    //   plugins.push(linkerPlugin);
    // }
    const sideEffectFree = options.sideEffects === false;
    const safeAngularPackage =
      sideEffectFree && /[\\/]node_modules[\\/]@angular[\\/]/.test(filename);

    const {
      adjustStaticMembers,
      adjustTypeScriptEnums,
      elideAngularMetadata,
      markTopLevelPure,
    } = await import('./ast-transformations');

    let transformedData = adjustStaticMembers(data, {
      wrapDecorators: sideEffectFree,
    });
    transformedData = adjustTypeScriptEnums(transformedData);
    transformedData = elideAngularMetadata(transformedData);
    if (safeAngularPackage) {
      transformedData = markTopLevelPure(transformedData);
    }
    return transformedData;
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
