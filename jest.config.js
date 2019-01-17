module.exports = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'node'],
  testEnvironment: 'node',
  collectCoverageFrom: ['**/*.{ts}', '!**/node_modules/**']
};
