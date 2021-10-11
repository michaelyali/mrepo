import { isArrayFull, isIn } from '@nestled/util';
import { execSync } from 'child_process';
import { CommanderStatic } from 'commander';
import * as emoji from 'node-emoji';
import { join } from 'path';
import symlinkDir = require('symlink-dir');
import {
  CONFIG_FILE_NAME,
  DIGEST_CONFIG_FILE_NAME,
  DIGEST_MODE,
  DIGEST_MODE_DISPLAY,
  DIGEST_MODE_LIST,
} from '../constants';
import {
  IMrepoConfigFile,
  IMrepoDigestConfigFile,
  IMrepoDigestConfigFilePath,
  IMrepoDigestConfigFileMrepo,
  IMrepoDigestConfigFileMrepoTarget,
  IMrepoDigestConfigFileTarget,
} from '../interfaces';
import { loadConfigFile, loadDigestConfigFile, loadPackageJsonVersion, logger } from '../utils';

enum AvailableCommands {
  DIGEST = 'digest',
}

interface DigestCommandOptions {
  config: string;
  mode: DIGEST_MODE;
  packages?: string;
  withVersion?: string;
  distTag?: string;
  withLocalVersions?: boolean;
  quiet?: boolean;
}

export class DigestCommand {
  static load(program: CommanderStatic['program']) {
    /**
     * Digest packages
     */
    program
      .command(AvailableCommands.DIGEST)
      .alias('d')
      .arguments('[from]')
      .arguments('[to]')
      .option('-c, --config <value>', 'Config file name or path (optional)', DIGEST_CONFIG_FILE_NAME)
      .option('-m, --mode <value>', `Digest mode. One of ${DIGEST_MODE_LIST.join(', ')}. (optional)`)
      .option('-p, --packages <value>', 'Mrepo packages to digest, comma-separated (optional)')
      .option('--withVersion <value>', 'Install packages with version (optional)')
      .option('--distTag <value>', 'Install packages with dist tag (optional)')
      .option('--withLocalVersions', 'Install packages with their local versions (optional)', false)
      .option('--quiet', 'Run quietly (optional)', false)
      .description('Digest packages from mrepos to target repositories', {
        from: 'Mrepo names from the digest config file, comma-separated (optional)',
        to: 'Target names from the digest config file, comma-separated (optional)',
      })
      .action(async (from: string, to: string, options: DigestCommandOptions) => this.runDigest(from, to, options));
  }

  static async runDigest(from: string, to: string, options: DigestCommandOptions) {
    const config = loadDigestConfigFile(options.config);
    const mrepos = this.getMreposFromConfig(from, config, options);

    for (const mrepo of mrepos) {
      const mrepoPath = this.getPathFromConfig(mrepo.name, config, options);
      const mrepoConfig = this.loadMrepoConfigFile(mrepo.name, mrepoPath.path);
      const mrepoTargets = this.getMrepoTargetFromConfig(mrepo, to);

      if (isArrayFull(mrepoTargets)) {
        for (const mrepoTarget of mrepoTargets) {
          const target = this.getTargetFromConfig(mrepoTarget.name, config, options);
          const targetPath = this.getPathFromConfig(target.name, config, options);
          const digestPackages = this.getTargetDigestPackages(mrepo, mrepoTarget, mrepoConfig, options);

          if (isArrayFull(digestPackages)) {
            const mode = this.getMode(config, mrepoTarget, options);
            switch (mode) {
              case DIGEST_MODE.INSTALL:
                this.runInstall(mrepoConfig, mrepoPath, targetPath, target, digestPackages, options);
                break;

              case DIGEST_MODE.LINK:
                await this.runSymlink(mrepoConfig, mrepoPath, targetPath, digestPackages);
                break;

              case DIGEST_MODE.COPY:
                await this.runCopy(mrepoConfig, mrepoPath, targetPath, digestPackages, options);
              default:
                break;
            }

            logger.info(AvailableCommands.DIGEST, `${DIGEST_MODE_DISPLAY[mode]}: ${mrepo.name} -> ${target.name}`);
          } else {
            logger.info(
              AvailableCommands.DIGEST,
              `Mrepo ${mrepo.name} has no selected allowed packages to digest for ${target.name}`,
            );
          }
        }
      } else {
        logger.info(AvailableCommands.DIGEST, `Mrepo ${mrepo.name} has no targets to digest`);
      }
    }
  }

  static removeFromNodeModules(
    mrepoConfig: IMrepoConfigFile,
    targetPath: IMrepoDigestConfigFilePath,
    digestPackages: string[],
    lib = false,
  ): void {
    const packagesStr = digestPackages
      .map((p) => join(targetPath.path, 'node_modules', `@${mrepoConfig.workspace.scope}`, p, lib ? 'lib' : ''))
      .join(' ');

    execSync(`npx rimraf ${packagesStr}`, {
      stdio: 'ignore',
    });
  }

  static runInstall(
    mrepoConfig: IMrepoConfigFile,
    mrepoPath: IMrepoDigestConfigFilePath,
    targetPath: IMrepoDigestConfigFilePath,
    target: IMrepoDigestConfigFileTarget,
    digestPackages: string[],
    options: DigestCommandOptions,
  ): void {
    this.removeFromNodeModules(mrepoConfig, targetPath, digestPackages);

    const packagesStr = digestPackages
      .map((p) => {
        const version = options.distTag
          ? options.distTag
          : options.withVersion
          ? options.withVersion
          : options.withLocalVersions
          ? loadPackageJsonVersion(join(mrepoPath.path, mrepoConfig.workspace.name, p, 'package.json'))
          : '';

        return `@${mrepoConfig.workspace.scope}/${p}${version ? '@' + version : ''}`;
      })
      .join(' ');

    const cmd = `cd ${targetPath.path} && ${target.installExec} ${packagesStr}`;

    if (!options.quiet) {
      logger.info(AvailableCommands.DIGEST, cmd);
    }

    execSync(cmd, {
      stdio: options.quiet ? 'ignore' : 'inherit',
      shell: '/bin/bash',
      env: process.env,
    });
  }

  static async runSymlink(
    mrepoConfig: IMrepoConfigFile,
    mrepoPath: IMrepoDigestConfigFilePath,
    targetPath: IMrepoDigestConfigFilePath,
    digestPackages: string[],
  ): Promise<void> {
    this.removeFromNodeModules(mrepoConfig, targetPath, digestPackages);

    for (const digestPackage of digestPackages) {
      const sourcePath = join(mrepoPath.path, mrepoConfig.workspace.name, digestPackage);
      const destPath = join(targetPath.path, 'node_modules', `@${mrepoConfig.workspace.scope}`, digestPackage);

      await symlinkDir(sourcePath, destPath);
    }
  }

  static async runCopy(
    mrepoConfig: IMrepoConfigFile,
    mrepoPath: IMrepoDigestConfigFilePath,
    targetPath: IMrepoDigestConfigFilePath,
    digestPackages: string[],
    options: DigestCommandOptions,
  ): Promise<void> {
    this.removeFromNodeModules(mrepoConfig, targetPath, digestPackages, true);

    for (const digestPackage of digestPackages) {
      const sourcePath = join(mrepoPath.path, mrepoConfig.workspace.name, digestPackage, 'lib', '**', '*');
      const destPath = join(targetPath.path, 'node_modules', `@${mrepoConfig.workspace.scope}`, digestPackage, 'lib');

      execSync(`npx cpx "${sourcePath}" "${destPath}"`, {
        stdio: options.quiet ? 'ignore' : 'inherit',
        shell: '/bin/bash',
        env: process.env,
      });
    }
  }

  static getMode(
    config: IMrepoDigestConfigFile,
    mrepoTarget: IMrepoDigestConfigFileMrepoTarget,
    options: DigestCommandOptions,
  ): DIGEST_MODE {
    if (options.mode) {
      if (!isIn(options.mode, DIGEST_MODE_LIST)) {
        const msg = `${emoji.get(':flushed:')} Invalid digest mode. One of ${DIGEST_MODE_LIST.join(', ')} expected`;
        this.exit(msg);
      } else {
        return options.mode;
      }
    }

    return mrepoTarget.mode ? mrepoTarget.mode : config.mode ? config.mode : DIGEST_MODE.INSTALL;
  }

  static getPathFromConfig(
    name: string,
    config: IMrepoDigestConfigFile,
    options: DigestCommandOptions,
  ): IMrepoDigestConfigFilePath {
    const found = config.paths.find((o) => o.name === name);

    if (!found?.path) {
      const msg = `${emoji.get(':flushed:')} Can't find path for ${name} in ${options.config}`;
      this.exit(msg);
    }

    return found;
  }

  static getMreposFromConfig(
    from: string,
    config: IMrepoDigestConfigFile,
    options: DigestCommandOptions,
  ): IMrepoDigestConfigFileMrepo[] {
    return from ? from.split(',').map((name) => this.getMrepoFromConfig(name, config, options)) : config.mrepos;
  }

  static getMrepoFromConfig(
    name: string,
    config: IMrepoDigestConfigFile,
    options: DigestCommandOptions,
  ): IMrepoDigestConfigFileMrepo {
    const found = config.mrepos.find((o) => o.name === name);

    if (!found) {
      const msg = `${emoji.get(':flushed:')} Can't find mrepo ${name} in ${options.config}`;
      this.exit(msg);
    }

    return found;
  }

  static getMrepoTargetFromConfig(mrepo: IMrepoDigestConfigFileMrepo, to: string): IMrepoDigestConfigFileMrepoTarget[] {
    if (!isArrayFull(mrepo.targets)) {
      return [];
    }

    const toTargets = !to ? [] : to.split(',');

    if (!isArrayFull(toTargets)) {
      return mrepo.targets;
    }

    return mrepo.targets.filter((mt) => isIn(mt.name, toTargets));
  }

  static getTargetFromConfig(
    name: string,
    config: IMrepoDigestConfigFile,
    options: DigestCommandOptions,
  ): IMrepoDigestConfigFileTarget {
    const found = config.targets.find((o) => o.name === name);

    if (!found) {
      const msg = `${emoji.get(':flushed:')} Can't find target ${name} in ${options.config}`;
      this.exit(msg);
    }

    return found;
  }

  static loadMrepoConfigFile(name: string, path: string): IMrepoConfigFile {
    const mrepoConfig = loadConfigFile(path);

    if (!mrepoConfig) {
      const msg = `${emoji.get(':flushed:')} Can't find ${CONFIG_FILE_NAME} for ${name}`;
      this.exit(msg);
    }

    return mrepoConfig;
  }

  static getTargetDigestPackages(
    mrepo: IMrepoDigestConfigFileMrepo,
    mrepoTarget: IMrepoDigestConfigFileMrepoTarget,
    mrepoConfig: IMrepoConfigFile,
    options: DigestCommandOptions,
  ): string[] {
    const optionsPackages = options.packages ? options.packages.split(',') : [];
    let allPackages: string[];

    if (isArrayFull(optionsPackages)) {
      allPackages = optionsPackages;
    } else {
      const defaultPackages = isArrayFull(mrepo.defaultPackages) ? mrepo.defaultPackages : [];
      const mrepoTargetPackages = isArrayFull(mrepoTarget.packages) ? mrepoTarget.packages : [];
      const combinedPackages = [...mrepoTargetPackages, ...(mrepoTarget.noDefaultPackages ? [] : defaultPackages)];
      allPackages = combinedPackages;
    }

    allPackages = allPackages.filter((v, i, a) => a.indexOf(v) === i);

    return mrepoConfig.workspace.packages.filter((p) => isIn(p.name, allPackages)).map((p) => p.name);
  }

  static exit(msg: string) {
    logger.error(AvailableCommands.DIGEST, msg);
    process.exit(1);
  }

  static uniqArr(arr: any[]): any[] {
    return arr.filter((v, i, a) => a.indexOf(v) === i);
  }
}
