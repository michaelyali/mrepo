export const CMD = 'mrepo';
export const CONFIG_FILE_NAME = `${CMD}.json`;
export const PACKAGE_GENERATOR_PASSED_OPTIONS_ENV_VAR = 'PACKAGE_GENERATOR_PASSED_OPTIONS';
export enum LERNA_PACKAGES_VERSIONING {
  independent = 'independent',
  common = 'common',
}
export enum PACKAGE_REGISTRY {
  github = 'github',
  npm = 'npm',
}
export enum PACKAGE_REGISTRY_URL {
  github = 'npm.pkg.github.com',
  npm = 'registry.npmjs.org',
}
export enum GITHUB_NODE_AUTH_TOKEN_NAME {
  github = 'GITHUB_TOKEN',
  npm = 'NPM_TOKEN',
}
