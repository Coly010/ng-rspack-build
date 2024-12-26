import { availableParallelism } from 'node:os';

function isPresent(variable: string | undefined): variable is string {
  return typeof variable === 'string' && variable !== '';
}

const maxWorkersVariable = process.env['NG_BUILD_MAX_WORKERS'];
export const maxWorkers = isPresent(maxWorkersVariable)
  ? +maxWorkersVariable
  : Math.min(4, Math.max(availableParallelism() - 1, 1));
