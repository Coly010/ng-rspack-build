import { CoreConfig } from '@code-pushup/models';
import { mergeConfigs } from '@code-pushup/utils';
import {
  baseConfig,
  eslintConfig,
} from './tools/reports/code-pushup.preset.config';

export default mergeConfigs(baseConfig as CoreConfig, await eslintConfig());
