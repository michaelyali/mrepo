"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainCommands = void 0;
const util_1 = require("@nestled/util");
const color = require("chalk");
const child_process_1 = require("child_process");
const getGitBranch = require("current-git-branch");
const emoji = require("node-emoji");
const constants_1 = require("../constants");
const utils_1 = require("../utils");
var AvailableCommands;
(function (AvailableCommands) {
    AvailableCommands["CLEAN"] = "clean";
    AvailableCommands["BUILD"] = "build";
    AvailableCommands["TEST"] = "test";
    AvailableCommands["LINK"] = "link";
    AvailableCommands["UNLINK"] = "unlink";
    AvailableCommands["RELEASE"] = "release";
})(AvailableCommands || (AvailableCommands = {}));
const RELEASE_SEMVER = ['patch', 'minor', 'major', 'prepatch', 'preminor', 'premajor', 'prerelease', 'select'];
const RELEASE_SEMVER_STR = RELEASE_SEMVER.join(', ');
class MainCommands {
    static load(program, configFile) {
        const packagesNames = configFile.workspace.packages.map((p) => p.name);
        const packagesNamesStr = packagesNames.join(', ');
        const { scope, name: workspaceName } = configFile.workspace;
        program
            .command(AvailableCommands.CLEAN)
            .alias('c')
            .arguments('[package]')
            .description('Clean package(s)', {
            package: `Package name, if specified. One of: ${packagesNamesStr}`,
        })
            .action((packageName) => runClean(packageName));
        program
            .command(AvailableCommands.BUILD)
            .alias('b')
            .arguments('[package]')
            .description('Build package(s)', {
            package: `Package name, if specified. One of: ${packagesNamesStr}`,
        })
            .action((packageName) => runBuild(packageName));
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
            .action((packageName, options) => runTest(packageName, options));
        program
            .command(AvailableCommands.LINK)
            .alias('l')
            .arguments('[package]')
            .option('--build', 'Build before linking', false)
            .description('Link package(s)', {
            package: `Package name, if specified. One of: ${packagesNamesStr}`,
        })
            .action((packageName, options) => runLink(packageName, options));
        program
            .command(AvailableCommands.UNLINK)
            .alias('u')
            .arguments('[package]')
            .description('Unlink package(s)', {
            package: `Package name, if specified. One of: ${packagesNamesStr}`,
        })
            .action((packageName) => runUnlink(packageName));
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
            .action((semver, options) => runRelease(semver, options));
        function runClean(packageName) {
            const placesToRemove = ['lib', 'tsconfig.tsbuildinfo', 'node_modules', 'package-lock.json'];
            const exec = (pName) => {
                const p = `./${workspaceName}/${pName}/`;
                utils_1.logger.info(AvailableCommands.CLEAN, `Cleaning ${color.italic.bold(pName)}`, emoji.get(':boom:'));
                child_process_1.execSync(`npx rimraf ${placesToRemove.map((n) => p + n).join(' ')}`, { stdio: 'inherit' });
            };
            if (!packageName) {
                packagesNames.forEach((pName) => {
                    exec(pName);
                });
            }
            else {
                validatePackageExist(packageName, packagesNames);
                exec(packageName);
            }
            utils_1.logger.info(AvailableCommands.CLEAN, `Cleaning ${color.green('done')}`, emoji.get(':ok_hand:'));
        }
        function runBuild(packageName) {
            const exec = (pName) => {
                utils_1.logger.info(AvailableCommands.BUILD, `Building ${color.italic.bold(pName)}`, emoji.get(':package:'));
                child_process_1.execSync(`npx lerna run build --scope @${scope}/${pName}`, { stdio: 'inherit' });
            };
            if (!packageName) {
                packagesNames.forEach((pName) => {
                    exec(pName);
                });
            }
            else {
                validatePackageExist(packageName, packagesNames);
                exec(packageName);
            }
            utils_1.logger.info(AvailableCommands.BUILD, `Building ${color.green('done')}`, emoji.get(':ok_hand:'));
        }
        function runTest(packageName, options) {
            const config = `-c=${options.config}`;
            const coverage = options.coverage ? '--coverage' : '';
            const verbose = options.verbose ? '--verbose' : '';
            const suite = options.suite ? options.suite : '';
            let where = '';
            let collectCoverageFrom = '';
            if (!packageName) {
                utils_1.logger.info(AvailableCommands.TEST, 'Running tests', emoji.get(':zap:'));
                where = `${options.folder}/*`;
            }
            else {
                validatePackageExist(packageName, packagesNames);
                utils_1.logger.info(AvailableCommands.TEST, `Running tests for ${color.italic.bold(packageName)}`, emoji.get(':zap:'));
                where = `${options.folder}/${packageName}/${suite}`;
                if (coverage) {
                    const addToRules = options.addCollectCoverageFrom ? options.addCollectCoverageFrom : '';
                    collectCoverageFrom = `--collectCoverageFrom='["${options.folder}/${packageName}/**/*.ts","!${options.folder}/${packageName}/**/*.d.ts","!${options.folder}/${packageName}/**/index.ts","!${options.folder}/${packageName}/**/*.interface.ts","!**/node_modules/**","!**/__stubs__/**","!**/__fixture__/**","!integration/*"${addToRules ? ',"' + addToRules.split(',').join('","') + '"' : ''}]'`;
                }
            }
            const cmd = `npx jest --runInBand --detectOpenHandles ${config} ${where} ${coverage} ${collectCoverageFrom} ${verbose}`;
            child_process_1.execSync(cmd, { stdio: 'inherit' });
            utils_1.logger.info(AvailableCommands.TEST, `Running tests ${color.green('done')}`, emoji.get(':ok_hand:'));
        }
        function runLink(packageName, options) {
            const exec = (pName) => {
                utils_1.logger.info(AvailableCommands.LINK, `Linking ${color.italic.bold(pName)}`, emoji.get(':loudspeaker:'));
                child_process_1.execSync(`cd ./${workspaceName}/${pName} && npm link`, { stdio: 'inherit' });
            };
            if (!packageName) {
                if (options.build) {
                    runBuild();
                }
                packagesNames.forEach((pName) => {
                    exec(pName);
                });
            }
            else {
                validatePackageExist(packageName, packagesNames);
                if (options.build) {
                    runBuild(packageName);
                }
                exec(packageName);
            }
            utils_1.logger.info(AvailableCommands.LINK, `Linking ${color.green('done')}`, emoji.get(':ok_hand:'));
        }
        function runUnlink(packageName) {
            const exec = (pName) => {
                utils_1.logger.info(AvailableCommands.UNLINK, `Unlinking ${color.italic.bold(pName)}`, emoji.get(':loudspeaker:'));
                child_process_1.execSync(`cd ./${workspaceName}/${pName} && npm unlink`, { stdio: 'inherit' });
            };
            if (!packageName) {
                packagesNames.forEach((pName) => {
                    exec(pName);
                });
            }
            else {
                exec(packageName);
            }
            utils_1.logger.info(AvailableCommands.UNLINK, `Unlinking ${color.green('done')}`, emoji.get(':ok_hand:'));
        }
        function runRelease(semver, options) {
            utils_1.logger.info(AvailableCommands.RELEASE, 'Creating new release version(s)', emoji.get(':rocket:'));
            const lernaFile = utils_1.loadLernaFile();
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
            child_process_1.execSync(lernaVersionCmd, { stdio: 'inherit' });
            if (isIndependent) {
                child_process_1.execSync(`npx json -I -f ${process.cwd()}/lerna.json -e "this.distTag='${options.distTag}'"`);
                child_process_1.execSync(`git add . && git commit -m "chore: release with --dist-tag=${options.distTag}"`);
            }
            else {
                const updatedLernaFile = utils_1.loadLernaFile();
                child_process_1.execSync(`git add . && git commit -m "chore: release v${updatedLernaFile.version}"`);
            }
            utils_1.logger.info(AvailableCommands.RELEASE, `Creating new release version(s) ${color.green('done')}`, emoji.get(':ok_hand:'));
        }
        function validatePackageExist(packageName, packagesNames) {
            if (!util_1.isIn(packageName, packagesNames)) {
                const msg = `${emoji.get(':flushed:')} Sorry, package ${color.bold(name)} hasn't been specified in ${color.bold(`${constants_1.CONFIG_FILE_NAME} -> workspace -> packages`)}`;
                utils_1.logger.error('oops', msg);
                throw new Error(msg);
            }
        }
        function validateReleaseSemver(semver) {
            if (!util_1.isIn(semver, RELEASE_SEMVER)) {
                const msg = `${emoji.get(':flushed:')} Sorry, release version semver type must be one of ${color.bold(RELEASE_SEMVER_STR)}`;
                utils_1.logger.error('oops', msg);
                throw new Error(msg);
            }
        }
        function validateReleaseGitBranch() {
            const branch = getGitBranch({
                altPath: process.cwd(),
            });
            if (!branch || !branch.startsWith('release')) {
                const msg = `${emoji.get(':flushed:')} Sorry, release branch name should start with ${color.bold('release')}`;
                utils_1.logger.error('oops', msg);
                throw new Error(msg);
            }
        }
    }
}
exports.MainCommands = MainCommands;
//# sourceMappingURL=main.commands.js.map