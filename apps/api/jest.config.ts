import type { Config } from 'jest';

/**
 * Unit-test config for the API. Tests live next to the code they cover as
 * `*.spec.ts`. ts-jest compiles with the project tsconfig so decorators and the
 * `@/` path alias work the same as in the app.
 */
const config: Config = {
  rootDir: 'src',
  testEnvironment: 'node',
  testRegex: '\\.spec\\.ts$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/../tsconfig.json' }],
  },
  // Mirror the tsconfig `@/*` -> `src/*` path alias.
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  clearMocks: true,
  collectCoverageFrom: [
    '**/*.(service|repository).ts',
    'common/utils/**/*.ts',
    '!**/*.module.ts',
  ],
  coverageDirectory: '<rootDir>/../coverage',
};

export default config;
