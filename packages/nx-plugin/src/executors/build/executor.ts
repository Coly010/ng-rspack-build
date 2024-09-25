import { ExecutorContext, logger } from '@nx/devkit';
import { createAsyncIterable } from '@nx/devkit/src/utils/async-iterable';
import { MultiStats, Stats } from '@rspack/core';
import { BuildExecutorSchema } from './schema';
import { createRspackConfig } from '../../utils/create-rspack-config';
import { isMode } from '../../utils/mode-utils';
import { createCompiler, getStatsOptions } from '../../utils/create-compiler';

export async function* runExecutor(
  options: BuildExecutorSchema,
  context: ExecutorContext
) {
  if (!isMode(options.mode)) {
    throw new Error(
      `Error: ${options.mode} must be one of: 'production', 'development' or 'none'.`
    );
  }

  const rspackConfig = createRspackConfig(options, context);
  const compiler = createCompiler(rspackConfig);
  const iterable = createAsyncIterable<{
    success: boolean;
    outfile?: string;
  }>(async ({ next, done }) => {
    compiler.run(async (err, stats: Stats | MultiStats) => {
      compiler.close(() => {
        if (err) {
          logger.error(err);
          next({ success: false });
          return;
        }
        if (!compiler || !stats) {
          logger.error(new Error('Compiler or stats not available'));
          next({ success: false });
          return;
        }

        const statsOptions = getStatsOptions(compiler);
        const printedStats = stats.toString(statsOptions);
        // Avoid extra empty line when `stats: 'none'`
        if (printedStats) {
          console.error(printedStats);
        }
        next({
          success: !stats.hasErrors(),
        });
        done();
      });
    });
  });

  yield* iterable;
}

export default runExecutor;
