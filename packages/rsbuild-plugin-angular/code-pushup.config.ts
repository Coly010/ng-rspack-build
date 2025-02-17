import { CoreConfig } from '@code-pushup/models';
import eslintPlugin, {
  eslintConfigFromNxProject,
} from '@code-pushup/eslint-plugin';

export default {
  plugins: [
    await eslintPlugin(
      await eslintConfigFromNxProject('rsbuild-plugin-angular')
    ),
  ],
  categories: [
    {
      slug: 'bug-prevention',
      title: 'Bug prevention',
      description: 'Lint rules that find **potential bugs** in your code.',
      refs: [{ type: 'group', plugin: 'eslint', slug: 'problems', weight: 1 }],
    },
    {
      slug: 'code-style',
      title: 'Code style',
      description:
        'Lint rules that promote **good practices** and consistency in your code.',
      refs: [
        { type: 'group', plugin: 'eslint', slug: 'suggestions', weight: 1 },
      ],
    },
  ],
} satisfies CoreConfig;
