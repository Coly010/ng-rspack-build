/**
 * Generates a glob pattern to match all files with a given suffix.
 * This is useful for generating patterns for files with specific extensions.
 *
 * @param {string} suffix - The suffix string.
 * @returns {string} - A glob pattern matching all files with the given suffix.
 *
 * @example
 * fromSuffix('spec');
 * // Output: '**\/*.spec'
 */
const fromSuffix = (suffix) => `**/*.${suffix}`;

/**
 * Generates a glob pattern to match all files within a given directory.
 *
 * @param {string} dir - The directory name.
 * @returns {string} - A glob pattern matching all files within the directory.
 *
 * @example
 * fromDirectory('__tests__');
 * // Output: '**\/__tests__/**\/*'
 *
 * fromDirectory('mocks');
 * // Output: '**\/mocks/**\/*'
 */
const fromDirectory = (dir) => `**/${dir}/**/*`;

/**
 * Appends JavaScript-related extensions to a list of glob patterns.
 *
 * @param {string[]} patterns - The base glob patterns.
 * @param {{ skipJSX?: boolean }} [options={}] - Optional settings.
 * @param {boolean} [options.skipJSX=false] - If true, excludes `.jsx` and `.tsx` extensions.
 * @returns {string[]} - The transformed glob patterns with extensions.
 *
 * @example
 * withExtensions(['**\/*.config']);
 * // Output: [
 * //   '**\/*.config.?(c|m)[jt]s?(x)'
 * // ]
 *
 * withExtensions(['**\/*.config'], { skipJSX: true });
 * // Output: [
 * //   '**\/*.config.?(c|m)[jt]s'
 * // ]
 */
const withExtensions = (patterns, options = {}) =>
  patterns.map(
    (pattern) => `${pattern}.?(c|m)[jt]s${options.skipJSX ? '' : '?(x)'}`
  );

const VITEST_CONFIG_FILE_PATTERNS = withExtensions(
  [
    '**/vitest.config',
    '**/vitest.unit.config',
    '**/vitest.integration.config',
    '**/vitest.e2e.config',
  ],
  { skipJSX: true }
);
/**
 * Predefined glob patterns for configuration files.
 * Includes various config files commonly used in JavaScript projects.
 *
 * @example
 * console.log(CONFIG_FILE_PATTERNS);
 * // Output: [
 * //   '**\/*.config.?(c|m)[jt]s',
 * //   '**\/.prettierrc.?(c|m)[jt]s',
 * //   '**\/codegen.?(c|m)[jt]s',
 * //   '**\/test-setup.?(c|m)[jt]s',
 * //   '**\/code-pushup.config.?(c|m)[jt]s'
 * // ]
 */
const CONFIG_FILE_PATTERNS = withExtensions(
  [
    '**/*.config',
    '**/.prettierrc',
    '**/codegen',
    '**/test-setup',
    '**/code-pushup.config',
  ],
  { skipJSX: true }
);

/**
 * Predefined glob patterns for unit test files.
 *
 * @example
 * console.log(UNIT_INTEGRATION_TEST_FILE_PATTERNS);
 * // Output: [
 * //   '**\/*.unit.?(c|m)[jt]s?(x)',
 * //   '**\/*.integration.?(c|m)[jt]s?(x)',
 * //   '**\/__tests__/**\/*.(c|m)[jt]s?(x)'
 * // ]
 */
const UNIT_INTEGRATION_TEST_FILE_PATTERNS = withExtensions([
  fromSuffix('unit.test'),
  fromSuffix('integration.test'),
  fromDirectory('__tests__'),
]);

/**
 * Predefined glob patterns for all test-related files.
 * This includes unit tests, mocks, integration tests, and other test-related utilities.
 *
 * @example
 * console.log(TEST_FILE_PATTERNS);
 * // Output: [
 * //   '**\/*.spec.?(c|m)[jt]s?(x)',
 * //   '**\/*.test.?(c|m)[jt]s?(x)',
 * //   '**\/__tests__/**\/*.(c|m)[jt]s?(x)',
 * //   '**\/__mocks__/**\/*.(c|m)[jt]s?(x)',
 * //   '**\/*.cy.?(c|m)[jt]s?(x)',
 * //   '**\/*.stories.?(c|m)[jt]s?(x)',
 * //   '**\/*.e2e.?(c|m)[jt]s?(x)',
 * //   '**\/*.mock.?(c|m)[jt]s?(x)',
 * //   '**\/*.mocks.?(c|m)[jt]s?(x)',
 * //   '**\/test/**\/*.(c|m)[jt]s?(x)',
 * //   '**\/tests/**\/*.(c|m)[jt]s?(x)',
 * //   '**\/mocks/**\/*.(c|m)[jt]s?(x)',
 * //   '**\/testing-utils/**\/*.(c|m)[jt]s?(x)',
 * //   '**\/test-utils/**\/*.(c|m)[jt]s?(x)',
 * //   '**\/fixtures/**\/*.(c|m)[jt]s?(x)',
 * //   '**\/*.config.?(c|m)[jt]s',
 * //   '**\/.prettierrc.?(c|m)[jt]s',
 * //   '**\/codegen.?(c|m)[jt]s',
 * //   '**\/test-setup.?(c|m)[jt]s'
 * // ]
 */
const TEST_FILE_PATTERNS = [
  ...UNIT_INTEGRATION_TEST_FILE_PATTERNS,
  ...withExtensions([
    fromDirectory('__mocks__'),
    fromSuffix('cy'),
    fromSuffix('stories'),
    fromSuffix('e2e'),
    fromSuffix('mock'),
    fromSuffix('mocks'),
    fromDirectory('test'),
    fromDirectory('tests'),
    fromDirectory('mocks'),
    fromDirectory('testing-utils'),
    fromDirectory('test-utils'),
    fromDirectory('fixtures'),
  ]),
  ...CONFIG_FILE_PATTERNS,
];

module.exports = {
  fromSuffix,
  fromDirectory,
  withExtensions,
  VITEST_CONFIG_FILE_PATTERNS,
  CONFIG_FILE_PATTERNS,
  UNIT_INTEGRATION_TEST_FILE_PATTERNS,
  TEST_FILE_PATTERNS,
};
