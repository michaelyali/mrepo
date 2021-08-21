export function loadPackageJsonVersion(path?: string): string {
  const packageJson = require(path ? path : '../../package');
  return packageJson.version;
}
