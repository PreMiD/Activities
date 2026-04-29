import antfu from '@antfu/eslint-config'
import eslintPluginJsonSchemaValidator from 'eslint-plugin-json-schema-validator'

export default antfu(
  {
    formatters: true,
    typescript: true,
  },
  ...eslintPluginJsonSchemaValidator.configs.base,
  {
    rules: {
      'new-cap': [
        'error',
        { newIsCapExceptions: ['iFrame'], capIsNew: false, newIsCap: true, properties: true },
      ],
      // Documentation pages intentionally use multiple H1s and skipped heading
      // levels for visual structure.
      'markdown/no-multiple-h1': 'off',
      'markdown/heading-increment': 'off',
    },
  },
  {
    files: ['**/*.json'],
    rules: {
      'jsonc/sort-keys': [
        'error',
        {
          pathPattern: '^$',
          order: [
            '$schema',
            'apiVersion',
            'author',
            'contributors',
            'service',
            'altnames',
            'description',
            'url',
            'regExp',
            'version',
            'logo',
            'thumbnail',
            'color',
            'category',
            'tags',
            'iframe',
            'iFrameRegExp',
            'readLogs',
            'settings',
            'mobile',
          ],
        },
        {
          pathPattern: '^settings$',
          order: ['id', 'title', 'icon', 'value', 'placeholder', 'if'],
        },
        {
          pathPattern: '^settings\\.if$',
          order: { type: 'asc' },
        },
        {
          pathPattern: '^description$',
          order: { type: 'asc' },
        },
      ],
    },
  },
  {
    files: ['**/*.json', '**/*.yaml', '**/*.yml'],
    rules: {
      'json-schema-validator/no-invalid': 'error',
    },
  },
  {
    files: ['websites/**/*.ts'],
    languageOptions: {
      parser: await import('@typescript-eslint/parser'),
      parserOptions: {
        project: './tsconfig.base.json',
      },
    },
    rules: {
      'ts/no-deprecated': 'error',
    },
  },
)
