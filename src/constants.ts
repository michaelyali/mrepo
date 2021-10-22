export const CMD = 'mrepo';
export const CONFIG_FILE_NAME = `${CMD}.json`;
export const DIGEST_CONFIG_FILE_NAME = `${CMD}-digest.json`;
export const TMP_BUILDS_CACHE_FILE_NAME = 'builds.cache';
export const TMP_FOLDER_NAME = '.mrepo';
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
export enum DIGEST_MODE {
  LINK = 'ln',
  INSTALL = 'install',
  COPY = 'copy',
}
export enum DIGEST_MODE_DISPLAY {
  'ln' = 'symlink',
  'install' = 'install',
  'copy' = 'copy',
}
export const DIGEST_MODE_LIST = Object.values(DIGEST_MODE);
