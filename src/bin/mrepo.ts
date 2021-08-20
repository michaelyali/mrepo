#!/usr/bin/env node

import { Command } from 'commander';
import { CONFIG_FILE_NAME } from '../constants';
import { MonorepoGeneratorCommand } from '../monorepo-generator/monorepo-generator.command';
import { DigestCommand } from '../commands/digest.command';
import { MainCommands } from '../commands/main.commands';
import { PackageGeneratorCommand } from '../package-generator/package-generator.command';
import { loadConfigFile, loadPackageJsonVersion, logger, validateConfigFile } from '../utils';

const packageVersion = loadPackageJsonVersion();
logger.notice('cli', `v${packageVersion}`);
const program = new Command();

const configFile = loadConfigFile();

if (configFile) {
  logger.notice('cli', `validating ${CONFIG_FILE_NAME}`);
  validateConfigFile(configFile);

  MainCommands.load(program, configFile);
  PackageGeneratorCommand.load(program, configFile);
} else {
  MonorepoGeneratorCommand.load(program);
}

DigestCommand.load(program);

program.version(loadPackageJsonVersion());
program.parse(process.argv);
