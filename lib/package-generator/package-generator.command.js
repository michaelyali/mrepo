"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageGeneratorCommand = void 0;
const color = require("chalk");
const child_process_1 = require("child_process");
const emoji = require("node-emoji");
const constants_1 = require("../constants");
const helpers_1 = require("../helpers");
const utils_1 = require("../utils");
var AvailableCommands;
(function (AvailableCommands) {
    AvailableCommands["GENERATE"] = "generate";
})(AvailableCommands || (AvailableCommands = {}));
class PackageGeneratorCommand {
    static load(program, configFile) {
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
            .action((packageName, options) => runGenerate(packageName, options));
        function runGenerate(packageName, options) {
            utils_1.logger.info(AvailableCommands.GENERATE, 'Generating new package', emoji.get(':video_game:'));
            const { dependencies, dependents } = validateScopeDepsOptions(options, configFile);
            const decideDependencies = dependencies ? dependencies : validateDefaultScopeDepsOptions(configFile);
            const envVar = helpers_1.createChildProcessPassedOptionsString({
                packageName,
                useDefaults: options.yes,
                dryRun: options.dryRun,
                dependencies: decideDependencies,
                dependents,
            });
            child_process_1.execSync(`${envVar} sao ${__dirname}`, { stdio: 'inherit' });
            utils_1.logger.info(AvailableCommands.GENERATE, `Generating ${color.green('done')}`, emoji.get(':ok_hand:'));
        }
        function validateScopeDepsOptions(options, configFile) {
            return {
                dependencies: validateScopePackagesExists(options.dependsOn, configFile),
                dependents: validateScopePackagesExists(options.dependentOf, configFile),
            };
        }
        function validateScopePackagesExists(namesString, configFile) {
            if (namesString) {
                return namesString
                    .split(',')
                    .map((name) => {
                    if (!configFile.workspace.packages.some((p) => p.name === name)) {
                        const msg = `${emoji.get(':flushed:')} Sorry, package ${color.bold(name)} hasn't been specified in ${color.bold(`${constants_1.CONFIG_FILE_NAME} -> workspace -> packages`)}`;
                        utils_1.logger.error('oops', msg);
                        throw new Error(msg);
                    }
                    return name;
                })
                    .join(',');
            }
        }
        function validateDefaultScopeDepsOptions(configFile) {
            var _a, _b, _c;
            if ((_c = (_b = (_a = configFile.packageGenerator) === null || _a === void 0 ? void 0 : _a.defaultOptions) === null || _b === void 0 ? void 0 : _b.dependencies) === null || _c === void 0 ? void 0 : _c.length) {
                return configFile.packageGenerator.defaultOptions.dependencies
                    .map((name) => {
                    if (!configFile.workspace.packages.some((p) => p.name === name)) {
                        const msg = `${emoji.get(':flushed:')} Sorry, package ${color.bold(name)} from ${color.bold(`${constants_1.CONFIG_FILE_NAME} -> packageGenerator -> defaultOptions -> dependencies`)} hasn't been specified in ${color.bold(`${constants_1.CONFIG_FILE_NAME} -> workspace -> packages`)}`;
                        utils_1.logger.error('oops', msg);
                        throw new Error(msg);
                    }
                    return name;
                })
                    .join(',');
            }
        }
    }
}
exports.PackageGeneratorCommand = PackageGeneratorCommand;
//# sourceMappingURL=package-generator.command.js.map