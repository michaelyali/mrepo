import { writeFileSync } from 'fs';
import { join } from 'path';
import { PACKAGE_REGISTRY, PACKAGE_REGISTRY_URL } from '../constants';
import { loadConfigFile } from './config-file.loader';

export function createPackagesNpmrc(authToken: string) {
  const configFile = loadConfigFile();
  const registryUrl =
    configFile.workspace.registry === PACKAGE_REGISTRY.github ? PACKAGE_REGISTRY_URL.github : PACKAGE_REGISTRY_URL.npm;
  const packagesNames = configFile.workspace.packages?.map((pkg) => pkg.name);

  packagesNames.forEach((name: string) => {
    const path = join(process.cwd(), `./${configFile.workspace.name}/${name}/.npmrc`);
    const content = `@${configFile.workspace.scope}:registry=https://${registryUrl}\n//${registryUrl}/:_authToken=${authToken}`;
    writeFileSync(path, content, { encoding: 'utf8' });
  });
}
