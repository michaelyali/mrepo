import * as color from 'chalk';
import { execSync } from 'child_process';
import { CommanderStatic } from 'commander';
import * as emoji from 'node-emoji';
import { PACKAGE_GENERATOR_PASSED_OPTIONS_ENV_VAR } from '../constants';
import { createChildProcessPassedOptionsString } from '../helpers';
import { logger } from '../utils';
import { IParentCommandPassedOptions } from './interfaces';

enum AvailableCommands {
  NEW = 'new',
}

export class MonorepoGeneratorCommand {
  static load(program: CommanderStatic['program']) {
    /**
     * Generate new monorepo
     */
    program
      .command(AvailableCommands.NEW)
      .alias('n')
      .arguments('<name>')
      .description('Generate new monorepo', {
        name: 'Monorepo name',
      })
      .option('-y, --yes', 'Use default options', false)
      .option('--dry-run', 'Dry run', false)
      .option('--skip-scripts', 'Skip post-generator scripts', false)
      .option('--skip-git', 'Skip git init', false)
      .option('--skip-git-commit', 'Skip git initial commit', false)
      .option('--skip-install', 'Skip dependencies installation', false)
      .action((name: string, options: any) => runNew(name, options));

    /**
     * Run `new` command
     * @param packageName string
     * @param options object
     */
    function runNew(name: string, options: any) {
      logger.info(AvailableCommands.NEW, 'Generating new monorepo', emoji.get(':rocket:'));
      const envVar = createChildProcessPassedOptionsString<IParentCommandPassedOptions>({
        name,
        useDefaults: options.yes,
        dryRun: options.dryRun,
        skipScripts: options.skipScripts,
        skipGit: options.skipGit,
        skipGitCommit: options.skipGitCommit,
        skipInstall: options.skipInstall,
      });

      execSync(`npx sao ${__dirname}`, {
        stdio: 'inherit',
        shell: '/bin/bash',
        env: { ...process.env, [PACKAGE_GENERATOR_PASSED_OPTIONS_ENV_VAR]: envVar },
      });
      logger.info(AvailableCommands.NEW, `New monorepo has been ${color.green('created')}`, emoji.get(':ok_hand:'));
    }
  }
}
