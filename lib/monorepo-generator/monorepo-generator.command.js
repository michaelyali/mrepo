"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonorepoGeneratorCommand = void 0;
const color = require("chalk");
const child_process_1 = require("child_process");
const emoji = require("node-emoji");
const constants_1 = require("../constants");
const helpers_1 = require("../helpers");
const utils_1 = require("../utils");
var AvailableCommands;
(function (AvailableCommands) {
    AvailableCommands["NEW"] = "new";
})(AvailableCommands || (AvailableCommands = {}));
class MonorepoGeneratorCommand {
    static load(program) {
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
            .action((name, options) => runNew(name, options));
        function runNew(name, options) {
            utils_1.logger.info(AvailableCommands.NEW, 'Generating new monorepo', emoji.get(':rocket:'));
            const envVar = helpers_1.createChildProcessPassedOptionsString({
                name,
                useDefaults: options.yes,
                dryRun: options.dryRun,
                skipScripts: options.skipScripts,
                skipGit: options.skipGit,
                skipGitCommit: options.skipGitCommit,
                skipInstall: options.skipInstall,
            });
            child_process_1.execSync(`npx sao ${__dirname}`, {
                stdio: 'inherit',
                shell: '/bin/bash',
                env: { ...process.env, [constants_1.PACKAGE_GENERATOR_PASSED_OPTIONS_ENV_VAR]: envVar },
            });
            utils_1.logger.info(AvailableCommands.NEW, `New monorepo has been ${color.green('created')}`, emoji.get(':ok_hand:'));
        }
    }
}
exports.MonorepoGeneratorCommand = MonorepoGeneratorCommand;
//# sourceMappingURL=monorepo-generator.command.js.map