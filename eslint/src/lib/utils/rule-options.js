const NAMING_CONVENTION_OPTIONS = [
  {
    selector: [
      'variableLike',
      'method',
      'typeProperty',
      'parameterProperty',
      'classProperty',
    ],
    format: ['camelCase'],
  },
  {
    selector: 'variable',
    format: ['camelCase', 'UPPER_CASE'],
  },
  {
    selector: 'typeLike',
    format: ['PascalCase'],
  },
  {
    selector: 'enumMember',
    format: ['PascalCase'],
  },
  {
    selector: 'parameter',
    modifiers: ['unused'],
    format: null,
    custom: {
      regex: '^(_+|[a-z][a-zA-Z0-9]*)$',
      match: true,
    },
  },
  {
    selector: 'objectLiteralProperty',
    modifiers: ['requiresQuotes'],
    format: null,
  },
  {
    selector: ['variable', 'parameter'],
    modifiers: ['destructured'],
    format: null,
  },
];

const NAMING_CONVENTION_OPTIONS_GRAPHQL = NAMING_CONVENTION_OPTIONS.map(
  (option, i) =>
    i === 0
      ? {
          ...option,
          filter: {
            regex: '^(_id|__typename|__resolveType)$',
            match: false,
          },
        }
      : option
);

const NAMING_CONVENTION_OPTIONS_STORYBOOK = NAMING_CONVENTION_OPTIONS.map(
  (option) =>
    option.selector === 'variable'
      ? {
          ...option,
          format: [...(option.format ?? []), 'PascalCase'],
        }
      : option
);

const NAMING_CONVENTION_OPTIONS_ANGULAR = [
  ...NAMING_CONVENTION_OPTIONS.map((option) =>
    Array.isArray(option.selector)
      ? {
          ...option,
          selector: option.selector.filter((s) => s !== 'classProperty'),
        }
      : option
  ),
  {
    selector: 'classProperty',
    format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
  },
];

const IMMUTABLE_DATA_OPTIONS = {
  ignoreImmediateMutation: true,
  ignoreClasses: true,
  ignoreAccessorPattern: 'module.exports',
};

module.exports = {
  NAMING_CONVENTION_OPTIONS,
  NAMING_CONVENTION_OPTIONS_GRAPHQL,
  NAMING_CONVENTION_OPTIONS_STORYBOOK,
  NAMING_CONVENTION_OPTIONS_ANGULAR,
  IMMUTABLE_DATA_OPTIONS,
};
