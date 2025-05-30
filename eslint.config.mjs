import nx from '@nx/eslint-plugin';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintPluginUnusedImports from 'eslint-plugin-unused-imports';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    plugins: {
      'unused-imports': eslintPluginUnusedImports,
      prettier: eslintPluginPrettier,
    },
  },
  {
    ignores: [
      '**/dist',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here
    rules: {
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
          printWidth: 120,
          semi: true,
          singleQuote: true,
          trailingComma: 'es5',
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        2,
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'unused-imports/no-unused-imports': 'error',
    },
  },
];
