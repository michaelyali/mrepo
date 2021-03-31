module.exports = {
  moduleFileExtensions: ['ts', 'js'],
  testRegex: '\\.spec.ts$',
  rootDir: '.',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.jest.json',
    },
  },
  coverageReporters: ['lcov', 'text-summary'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.ts'],
};
