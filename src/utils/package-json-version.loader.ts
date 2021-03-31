export function loadPackageJsonVersion(): string {
  const packageJson = require('../package');
  return packageJson.version;
}
