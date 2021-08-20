#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const constants_1 = require("../constants");
const monorepo_generator_command_1 = require("../monorepo-generator/monorepo-generator.command");
const digest_command_1 = require("../commands/digest.command");
const main_commands_1 = require("../commands/main.commands");
const package_generator_command_1 = require("../package-generator/package-generator.command");
const utils_1 = require("../utils");
const packageVersion = utils_1.loadPackageJsonVersion();
utils_1.logger.notice('cli', `v${packageVersion}`);
const program = new commander_1.Command();
const configFile = utils_1.loadConfigFile();
if (configFile) {
    utils_1.logger.notice('cli', `validating ${constants_1.CONFIG_FILE_NAME}`);
    utils_1.validateConfigFile(configFile);
    main_commands_1.MainCommands.load(program, configFile);
    package_generator_command_1.PackageGeneratorCommand.load(program, configFile);
}
else {
    monorepo_generator_command_1.MonorepoGeneratorCommand.load(program);
}
digest_command_1.DigestCommand.load(program);
program.version(utils_1.loadPackageJsonVersion());
program.parse(process.argv);
//# sourceMappingURL=mrepo.js.map