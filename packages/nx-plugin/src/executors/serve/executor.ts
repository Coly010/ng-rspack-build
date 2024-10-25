import {
  ExecutorContext,
  logger,
  parseTargetString,
  readTargetOptions,
  Target,
} from '@nx/devkit';
import { createAsyncIterable } from '@nx/devkit/src/utils/async-iterable';
import { RspackDevServer } from '@rspack/dev-server';
import { ServeExecutorSchema } from './schema';
import { createRspackConfig } from '../../utils/create-rspack-config';
import { createCompiler, isMultiCompiler } from '../../utils/create-compiler';

export async function* runExecutor(
  options: ServeExecutorSchema,
  context: ExecutorContext
) {
  let buildTarget: Target;
  try {
    buildTarget = parseTargetString(options.buildTarget, context.projectGraph);
  } catch (e) {
    console.error(`Error: Could not parse target string from 'buildTarget'`);
    throw e;
  }

  const buildTargetOptions = readTargetOptions(buildTarget, context);

  const rspackConfig = await createRspackConfig(
    { ...buildTargetOptions, port: options.port },
    context
  );
  const compiler = createCompiler(rspackConfig);
  const firstCompiler = isMultiCompiler(compiler)
    ? compiler.compilers[0]
    : compiler;
  const devServerOptions = firstCompiler.options.devServer;
  const baseUrl = `http://localhost:${options.port ?? 4200}`;

  const iterable = createAsyncIterable<{
    success: boolean;
    baseUrl?: string;
  }>(({ next }) => {
    const server = new RspackDevServer(
      {
        ...devServerOptions,
        onListening: () => {
          next({
            success: true,
            baseUrl,
          });
        },
      },
      compiler
    );
    server.compiler.hooks.done.tap('Rspack Dev Server', (stats) => {
      if (stats.hasErrors()) {
        logger.error(`Compilation failed. See above for more details.`);
      } else {
        logger.info(`Server ready at ${baseUrl}`);
      }
    });
    (server as unknown as { start: () => Promise<void> }).start();
  });

  yield* iterable;
}

export default runExecutor;
