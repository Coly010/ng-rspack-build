import { pluginAngular } from './lib/plugin/plugin-angular';
import { PluginAngularOptions } from './lib/models/plugin-options';
import { createConfig, withConfigurations } from './lib/config/create-config';

export { pluginAngular, createConfig, withConfigurations };
export type { PluginAngularOptions };
export default pluginAngular;
