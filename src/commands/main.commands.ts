import { isIn } from '@nestled/util';
import * as color from 'chalk';
import { execSync } from 'child_process';
import { CommanderStatic } from 'commander';
import * as getGitBranch from 'current-git-branch';
import * as emoji from 'node-emoji';
import { CONFIG_FILE_NAME } from '../constants';
import { hasCached, saveCache } from '../helpers';
import { IMrepoConfigFile } from '../interfaces';
import { loadLernaFile, logger } from '../utils';

enum AvailableCommands {
  CLEAN = 'clean',
  BUILD = 'build',
  TEST = 'test',
  LINK = 'link',
  UNLINK = 'unlink',
  RELEASE = 'release',
}

const RELEASE_SEMVER = ['patch', 'minor', 'major', 'prepatch', 'preminor', 'premajor', 'prerelease', 'select'];
const RELEASE_SEMVER_STR = RELEASE_SEMVER.join(', ');

export class MainCommands {
  static load(program: CommanderStatic['program'], configFile: IMrepoConfigFile) {
    const packagesNames = configFile.workspace.packages.map((p) => p.name);
    const packagesNamesStr = packagesNames.join(', ');
    const { scope, name: workspaceName } = configFile.workspace;

    /**
     * Clean packages
     */
    program
      .command(AvailableCommands.CLEAN)
      .alias('c')
      .arguments('[package]')
      .description('Clean package(s)', {
        package: `Package name, if specified. One of: ${packagesNamesStr}`,
      })
      .action((packageName: string) => runClean(packageName));

    /**
     * Build packages
     */
    program
      .command(AvailableCommands.BUILD)
      .alias('b')
      .arguments('[package]')
      .option('--no-cache', 'Force build without cache comparison', false)
      .description('Build package(s)', {
        package: `Package name, if specified. One of: ${packagesNamesStr}`,
      })
      .action(async (packageName: string, options: any) => runBuild(packageName, options.cache));

    /**
     * Test packages
     */
    program
      .command(AvailableCommands.TEST)
      .alias('t')
      .arguments('[package]')
      .description('Run tests for package(s)', {
        package: `Package name, if specified. One of: ${packagesNamesStr}`,
      })
      .option('-f, --folder <value>', 'Tests folder', workspaceName)
      .option('-s, --suite <value>', 'Test suite', '')
      .option('-c, --config <value>', 'Jest config file', 'jest.config.js')
      .option('--coverage', 'Run with coverage', false)
      .option('--addCollectCoverageFrom <value>', 'Add collect coverage rules to defaults', '')
      .option('--verbose', 'Run verbose', false)
      .description('Test package(s)', {
        package: `Package name, if specified. One of: ${packagesNamesStr}`,
      })
      .action((packageName: string, options: any) => runTest(packageName, options));

    /**
     * Link packages
     */
    program
      .command(AvailableCommands.LINK)
      .alias('l')
      .arguments('[package]')
      .option('--build', 'Build before linking', false)
      .description('Link package(s)', {
        package: `Package name, if specified. One of: ${packagesNamesStr}`,
      })
      .action((packageName: string, options: any) => runLink(packageName, options));

    /**
     * Unlink packages
     */
    program
      .command(AvailableCommands.UNLINK)
      .alias('u')
      .arguments('[package]')
      .description('Unlink package(s)', {
        package: `Package name, if specified. One of: ${packagesNamesStr}`,
      })
      .action((packageName: string) => runUnlink(packageName));

    /**
     * Release packages
     */
    program
      .command(AvailableCommands.RELEASE)
      .alias('r')
      .arguments('<semver> value')
      .option('--no-git-push', 'Skip git commit and push', false)
      .option('--no-changelog', 'Skip changelog generation', false)
      .option('--preid <value>', 'Prerelease identifier', 'alpha')
      .option('--dist-tag <value>', 'Dist tag if Lerna version is "independent"', 'latest')
      .option('--force-publish', 'Force packages release', false)
      .description('Release package(s)', {
        semver: `Package version semver type. One of: ${RELEASE_SEMVER_STR}`,
      })
      .action((semver: string, options: any) => runRelease(semver, options));

    /**
     * Run `clean` command
     * @param packageName string
     */
    function runClean(packageName?: string) {
      const placesToRemove = ['lib', 'tsconfig.tsbuildinfo', 'node_modules', 'package-lock.json'];

      const exec = (pName: string) => {
        const p = `./${workspaceName}/${pName}/`;

        logger.info(AvailableCommands.CLEAN, `Cleaning ${color.italic.bold(pName)}`, emoji.get(':boom:'));
        execSync(`npx rimraf ${placesToRemove.map((n) => p + n).join(' ')}`, { stdio: 'inherit' });
      };

      if (!packageName) {
        packagesNames.forEach((pName: string) => {
          exec(pName);
        });
      } else {
        validatePackageExist(packageName, packagesNames);
        exec(packageName);
      }

      logger.info(AvailableCommands.CLEAN, `Cleaning ${color.green('done')}`, emoji.get(':ok_hand:'));
    }

    /**
     * Run `build` command
     * @param packageName string
     */
    async function runBuild(packageName: string, useCache = true) {
      const exec = async (pName: string) => {
        const hasCache = await hasCached(workspaceName, packageName);

        if (!useCache || !hasCache) {
          logger.info(AvailableCommands.BUILD, `Building ${color.italic.bold(pName)}`, emoji.get(':package:'));
          execSync(`npx lerna run build --scope @${scope}/${pName}`, { stdio: 'inherit' });

          await saveCache(workspaceName, packageName);
        } else {
          logger.info(
            AvailableCommands.BUILD,
            `Package ${color.italic.bold(pName)} has been built already`,
            emoji.get(':ok_hand:'),
          );
        }
      };

      if (!packageName) {
        for (let i = 0; i < packagesNames.length; i++) {
          const pName = packagesNames[i];
          await exec(pName);
        }
      } else {
        validatePackageExist(packageName, packagesNames);
        exec(packageName);
      }

      logger.info(AvailableCommands.BUILD, `Building ${color.green('done')}`, emoji.get(':ok_hand:'));
    }

    /**
     * Run `test` command
     * @param packageName string
     * @param options object
     */
    function runTest(packageName?: string, options?: any) {
      const config = `-c=${options.config}`;
      const coverage = options.coverage ? '--coverage' : '';
      const verbose = options.verbose ? '--verbose' : '';
      const suite = options.suite ? options.suite : '';
      let where = '';
      let collectCoverageFrom = '';

      if (!packageName) {
        logger.info(AvailableCommands.TEST, 'Running tests', emoji.get(':zap:'));

        where = `${options.folder}/*`;
      } else {
        validatePackageExist(packageName, packagesNames);
        logger.info(AvailableCommands.TEST, `Running tests for ${color.italic.bold(packageName)}`, emoji.get(':zap:'));

        where = `${options.folder}/${packageName}/${suite}`;

        if (coverage) {
          const addToRules = options.addCollectCoverageFrom ? options.addCollectCoverageFrom : '';
          collectCoverageFrom = `--collectCoverageFrom='["${options.folder}/${packageName}/**/*.ts","!${
            options.folder
          }/${packageName}/**/*.d.ts","!${options.folder}/${packageName}/**/index.ts","!${
            options.folder
          }/${packageName}/**/*.interface.ts","!**/node_modules/**","!**/__stubs__/**","!**/__fixture__/**","!integration/*"${
            addToRules ? ',"' + addToRules.split(',').join('","') + '"' : ''
          }]'`;
        }
      }

      const cmd = `npx jest --runInBand --detectOpenHandles ${config} ${where} ${coverage} ${collectCoverageFrom} ${verbose}`;
      execSync(cmd, { stdio: 'inherit' });

      logger.info(AvailableCommands.TEST, `Running tests ${color.green('done')}`, emoji.get(':ok_hand:'));
    }

    /**
     * Run `link` command
     * @param packageName string
     * @param options object
     * @param configFile: IMrepoConfigFile
     */
    function runLink(packageName: string, options: any) {
      const exec = (pName: string) => {
        logger.info(AvailableCommands.LINK, `Linking ${color.italic.bold(pName)}`, emoji.get(':loudspeaker:'));
        execSync(`cd ./${workspaceName}/${pName} && npm link`, { stdio: 'inherit' });
      };

      if (!packageName) {
        if (options.build) {
          runBuild(undefined, false);
        }

        packagesNames.forEach((pName: string) => {
          exec(pName);
        });
      } else {
        validatePackageExist(packageName, packagesNames);

        if (options.build) {
          runBuild(packageName, false);
        }

        exec(packageName);
      }

      logger.info(AvailableCommands.LINK, `Linking ${color.green('done')}`, emoji.get(':ok_hand:'));
    }

    /**
     * Run `unlink` command
     * @param packageName string
     */
    function runUnlink(packageName?: string) {
      const exec = (pName: string) => {
        logger.info(AvailableCommands.UNLINK, `Unlinking ${color.italic.bold(pName)}`, emoji.get(':loudspeaker:'));
        execSync(`cd ./${workspaceName}/${pName} && npm unlink`, { stdio: 'inherit' });
      };

      if (!packageName) {
        packagesNames.forEach((pName: string) => {
          exec(pName);
        });
      } else {
        exec(packageName);
      }

      logger.info(AvailableCommands.UNLINK, `Unlinking ${color.green('done')}`, emoji.get(':ok_hand:'));
    }

    /**
     * Run `release` command
     * @param semver string
     */
    function runRelease(semver: string, options?: any) {
      logger.info(AvailableCommands.RELEASE, 'Creating new release version(s)', emoji.get(':rocket:'));

      const lernaFile = loadLernaFile();
      const isIndependent = lernaFile.version === 'independent';
      const isCustomVersion = semver === 'select';
      const semverStr = isCustomVersion ? '' : semver;

      validateReleaseSemver(semver);

      if (options.gitPush) {
        validateReleaseGitBranch();
      }

      const preid = semver.startsWith('pre') ? `--preid ${options.preid}` : '';
      const withChangelog = options.changelog && !isCustomVersion ? '--conventional-commits' : '';
      const forcePublish = options.forcePublish ? '--force-publish' : '';
      const lernaVersionCmd = `npx lerna version ${semverStr} --no-git-tag-version ${withChangelog} ${preid} ${forcePublish}`;

      execSync(lernaVersionCmd, { stdio: 'inherit' });

      if (isIndependent) {
        execSync(`npx json -I -f ${process.cwd()}/lerna.json -e "this.distTag='${options.distTag}'"`);
        execSync(`git add . && git commit -m "chore: release with --dist-tag=${options.distTag}"`);
      } else {
        const updatedLernaFile = loadLernaFile();
        execSync(`git add . && git commit -m "chore: release v${updatedLernaFile.version}"`);
      }

      logger.info(
        AvailableCommands.RELEASE,
        `Creating new release version(s) ${color.green('done')}`,
        emoji.get(':ok_hand:'),
      );
    }

    /**
     * Validate package exists in config
     * @param packageName string
     * @param packagesNames string[]
     */
    function validatePackageExist(packageName: string, packagesNames: string[]) {
      if (!isIn(packageName, packagesNames)) {
        const msg = `${emoji.get(':flushed:')} Sorry, package ${color.bold(name)} hasn't been specified in ${color.bold(
          `${CONFIG_FILE_NAME} -> workspace -> packages`,
        )}`;
        logger.error('oops', msg);

        throw new Error(msg);
      }
    }

    /**
     * Validate release semver
     * @param semver
     */
    function validateReleaseSemver(semver: string) {
      if (!isIn(semver, RELEASE_SEMVER)) {
        const msg = `${emoji.get(':flushed:')} Sorry, release version semver type must be one of ${color.bold(
          RELEASE_SEMVER_STR,
        )}`;
        logger.error('oops', msg);

        throw new Error(msg);
      }
    }

    function validateReleaseGitBranch() {
      const branch = getGitBranch({
        altPath: process.cwd(),
      });

      if (!branch || !branch.startsWith('release')) {
        const msg = `${emoji.get(':flushed:')} Sorry, release branch name should start with ${color.bold('release')}`;
        logger.error('oops', msg);

        throw new Error(msg);
      }
    }
  }
}
