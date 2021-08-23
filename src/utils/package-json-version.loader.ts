export function loadPackageJsonVersion(path?: string): string {
  const packageJson = require(path ? path : '../package.json');
  return packageJson.version;
}
