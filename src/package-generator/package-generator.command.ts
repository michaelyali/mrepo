import * as color from 'chalk';
import { execSync } from 'child_process';
import { CommanderStatic } from 'commander';
import * as emoji from 'node-emoji';
import { CONFIG_FILE_NAME, PACKAGE_GENERATOR_PASSED_OPTIONS_ENV_VAR } from '../constants';
import { IMrepoConfigFile } from '../interfaces';
import { createChildProcessPassedOptionsString } from '../helpers';
import { logger } from '../utils';
import { IParentCommandPassedOptions } from './interfaces/parent-command-passed-options.interface';

enum AvailableCommands {
  GENERATE = 'generate',
}

export class PackageGeneratorCommand {
  static load(program: CommanderStatic['program'], configFile: IMrepoConfigFile) {
    /**
     * Generate new package
     */
    program
      .command(AvailableCommands.GENERATE)
      .alias('g')
      .arguments('[package]')
      .description('Generate new package', {
        package: 'Package name, if specified.',
      })
      .option('-y, --yes', 'Use default options', false)
      .option('--dry-run', 'Dry run', false)
      .option('--depends-on <pacakges>', 'Depends on scope package(s), comma-separated')
      .option('--dependent-of <pacakges>', 'Dependent of scope package(s), comma-separated')
      .action((packageName: string, options: any) => runGenerate(packageName, options));

    /**
     * Run `generate` command
     * @param packageName string
     * @param options object
     */
    function runGenerate(packageName: string, options: any) {
      logger.info(AvailableCommands.GENERATE, 'Generating new package', emoji.get(':video_game:'));
      const { dependencies, dependents } = validateScopeDepsOptions(options, configFile);
      const decideDependencies = dependencies ? dependencies : validateDefaultScopeDepsOptions(configFile);
      const envVar = createChildProcessPassedOptionsString<IParentCommandPassedOptions>({
        packageName,
        useDefaults: options.yes,
        dryRun: options.dryRun,
        dependencies: decideDependencies,
        dependents,
      });

      execSync(`sao ${__dirname}`, {
        stdio: 'inherit',
        shell: '/bin/bash',
        env: { ...process.env, [PACKAGE_GENERATOR_PASSED_OPTIONS_ENV_VAR]: envVar },
      });
      logger.info(AvailableCommands.GENERATE, `Generating ${color.green('done')}`, emoji.get(':ok_hand:'));
    }

    function validateScopeDepsOptions(
      options: any,
      configFile: IMrepoConfigFile,
    ): Pick<IParentCommandPassedOptions, 'dependencies' | 'dependents'> {
      return {
        dependencies: validateScopePackagesExists(options.dependsOn, configFile),
        dependents: validateScopePackagesExists(options.dependentOf, configFile),
      };
    }

    function validateScopePackagesExists(namesString: string, configFile: IMrepoConfigFile): string {
      if (namesString) {
        return namesString
          .split(',')
          .map((name: string) => {
            if (!configFile.workspace.packages.some((p) => p.name === name)) {
              const msg = `${emoji.get(':flushed:')} Sorry, package ${color.bold(
                name,
              )} hasn't been specified in ${color.bold(`${CONFIG_FILE_NAME} -> workspace -> packages`)}`;
              logger.error('oops', msg);
              throw new Error(msg);
            }

            return name;
          })
          .join(',');
      }
    }

    function validateDefaultScopeDepsOptions(configFile: IMrepoConfigFile): string {
      if (configFile.packageGenerator?.defaultOptions?.dependencies?.length) {
        return configFile.packageGenerator.defaultOptions.dependencies
          .map((name: string) => {
            if (!configFile.workspace.packages.some((p) => p.name === name)) {
              const msg = `${emoji.get(':flushed:')} Sorry, package ${color.bold(name)} from ${color.bold(
                `${CONFIG_FILE_NAME} -> packageGenerator -> defaultOptions -> dependencies`,
              )} hasn't been specified in ${color.bold(`${CONFIG_FILE_NAME} -> workspace -> packages`)}`;
              logger.error('oops', msg);
              throw new Error(msg);
            }

            return name;
          })
          .join(',');
      }
    }
  }
}
