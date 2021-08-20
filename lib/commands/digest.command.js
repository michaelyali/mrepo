"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DigestCommand = void 0;
const util_1 = require("@nestled/util");
const child_process_1 = require("child_process");
const emoji = require("node-emoji");
const path_1 = require("path");
const symlinkDir = require("symlink-dir");
const constants_1 = require("../constants");
const utils_1 = require("../utils");
var AvailableCommands;
(function (AvailableCommands) {
    AvailableCommands["DIGEST"] = "digest";
})(AvailableCommands || (AvailableCommands = {}));
class DigestCommand {
    static load(program) {
        program
            .command(AvailableCommands.DIGEST)
            .alias('d')
            .arguments('[from]')
            .arguments('[to]')
            .option('-c, --config <value>', 'Config file name or path (optional)', constants_1.DIGEST_CONFIG_FILE_NAME)
            .option('-m, --mode <value>', `Digest mode. One of ${constants_1.DIGEST_MODE_LIST.join(', ')}. (optional)`)
            .option('-p, --packages <value>', 'Mrepo packages to digest, comma-separated (optional)')
            .option('--installVersion <value>', 'Install packages with version')
            .option('--quiet', 'Run quietly', false)
            .description('Digest packages from mrepos to target repositories', {
            from: 'Mrepo names from the digest config file, comma-separated (optional)',
            to: 'Target names from the digest config file, comma-separated (optional)',
        })
            .action(async (from, to, options) => this.runDigest(from, to, options));
    }
    static async runDigest(from, to, options) {
        const config = utils_1.loadDigestConfigFile(options.config);
        const mrepos = this.getMreposFromConfig(from, config, options);
        for (const mrepo of mrepos) {
            const mrepoPath = this.getPathFromConfig(mrepo.name, config, options);
            const mrepoConfig = this.loadMrepoConfigFile(mrepo.name, mrepoPath.path);
            const mrepoTargets = this.getMrepoTargetFromConfig(mrepo, to);
            if (util_1.isArrayFull(mrepoTargets)) {
                for (const mrepoTarget of mrepoTargets) {
                    const target = this.getTargetFromConfig(mrepoTarget.name, config, options);
                    const targetPath = this.getPathFromConfig(target.name, config, options);
                    const digestPackages = this.getTargetDigestPackages(mrepo, mrepoTarget, mrepoConfig, options);
                    if (util_1.isArrayFull(digestPackages)) {
                        const mode = this.getMode(config, mrepoTarget, options);
                        switch (mode) {
                            case constants_1.DIGEST_MODE.INSTALL:
                                this.runInstall(mrepoConfig, targetPath, target, digestPackages, options);
                                break;
                            case constants_1.DIGEST_MODE.LINK:
                                await this.runSymlink(mrepoConfig, mrepoPath, targetPath, digestPackages);
                                break;
                            default:
                                break;
                        }
                        utils_1.logger.info(AvailableCommands.DIGEST, `${constants_1.DIGEST_MODE_DISPLAY[mode]}: ${mrepo.name} -> ${target.name}`);
                    }
                    else {
                        utils_1.logger.info(AvailableCommands.DIGEST, `Mrepo ${mrepo.name} has no selected allowed packages to digest for ${target.name}`);
                    }
                }
            }
            else {
                utils_1.logger.info(AvailableCommands.DIGEST, `Mrepo ${mrepo.name} has no targets to digest`);
            }
        }
    }
    static removeFromNodeModules(mrepoConfig, targetPath, digestPackages) {
        const packagesStr = digestPackages
            .map((p) => path_1.join(targetPath.path, 'node_modules', `@${mrepoConfig.workspace.scope}`, p))
            .join(' ');
        child_process_1.execSync(`npx rimraf ${packagesStr}`, {
            stdio: 'ignore',
        });
    }
    static runInstall(mrepoConfig, targetPath, target, digestPackages, options) {
        this.removeFromNodeModules(mrepoConfig, targetPath, digestPackages);
        const packagesStr = digestPackages
            .map((p) => `@${mrepoConfig.workspace.scope}/${p}${options.installVersion ? '@' + options.installVersion : ''}`)
            .join(' ');
        const cmd = `cd ${targetPath.path} && ${target.installExec} ${packagesStr}`;
        if (!options.quiet) {
            utils_1.logger.info(AvailableCommands.DIGEST, cmd);
        }
        child_process_1.execSync(cmd, {
            stdio: options.quiet ? 'ignore' : 'inherit',
        });
    }
    static async runSymlink(mrepoConfig, mrepoPath, targetPath, digestPackages) {
        this.removeFromNodeModules(mrepoConfig, targetPath, digestPackages);
        for (const digestPackage of digestPackages) {
            const sourcePath = path_1.join(mrepoPath.path, mrepoConfig.workspace.name, digestPackage);
            const destPath = path_1.join(targetPath.path, 'node_modules', `@${mrepoConfig.workspace.scope}`, digestPackage);
            await symlinkDir(sourcePath, destPath);
        }
    }
    static getMode(config, mrepoTarget, options) {
        if (options.mode) {
            if (!util_1.isIn(options.mode, constants_1.DIGEST_MODE_LIST)) {
                const msg = `${emoji.get(':flushed:')} Invalid digest mode. One of ${constants_1.DIGEST_MODE_LIST.join(', ')} expected`;
                this.exit(msg);
            }
            else {
                return options.mode;
            }
        }
        return mrepoTarget.mode ? mrepoTarget.mode : config.mode ? config.mode : constants_1.DIGEST_MODE.INSTALL;
    }
    static getPathFromConfig(name, config, options) {
        const found = config.paths.find((o) => o.name === name);
        if (!(found === null || found === void 0 ? void 0 : found.path)) {
            const msg = `${emoji.get(':flushed:')} Can't find path for ${name} in ${options.config}`;
            this.exit(msg);
        }
        return found;
    }
    static getMreposFromConfig(from, config, options) {
        return from ? from.split(',').map((name) => this.getMrepoFromConfig(name, config, options)) : config.mrepos;
    }
    static getMrepoFromConfig(name, config, options) {
        const found = config.mrepos.find((o) => o.name === name);
        if (!found) {
            const msg = `${emoji.get(':flushed:')} Can't find mrepo ${name} in ${options.config}`;
            this.exit(msg);
        }
        return found;
    }
    static getMrepoTargetFromConfig(mrepo, to) {
        if (!util_1.isArrayFull(mrepo.targets)) {
            return [];
        }
        const toTargets = !to ? [] : to.split(',');
        if (!util_1.isArrayFull(toTargets)) {
            return mrepo.targets;
        }
        return mrepo.targets.filter((mt) => util_1.isIn(mt.name, toTargets));
    }
    static getTargetFromConfig(name, config, options) {
        const found = config.targets.find((o) => o.name === name);
        if (!found) {
            const msg = `${emoji.get(':flushed:')} Can't find target ${name} in ${options.config}`;
            this.exit(msg);
        }
        return found;
    }
    static loadMrepoConfigFile(name, path) {
        const mrepoConfig = utils_1.loadConfigFile(path);
        if (!mrepoConfig) {
            const msg = `${emoji.get(':flushed:')} Can't find ${constants_1.CONFIG_FILE_NAME} for ${name}`;
            this.exit(msg);
        }
        return mrepoConfig;
    }
    static getTargetDigestPackages(mrepo, mrepoTarget, mrepoConfig, options) {
        const optionsPackages = options.packages ? options.packages.split(',') : [];
        let allPackages;
        if (util_1.isArrayFull(optionsPackages)) {
            allPackages = optionsPackages;
        }
        else {
            const defaultPackages = util_1.isArrayFull(mrepo.defaultPackages) ? mrepo.defaultPackages : [];
            const mrepoTargetPackages = util_1.isArrayFull(mrepoTarget.packages) ? mrepoTarget.packages : [];
            const combinedPackages = [...mrepoTargetPackages, ...(mrepoTarget.noDefaultPackages ? [] : defaultPackages)];
            allPackages = combinedPackages;
        }
        allPackages = allPackages.filter((v, i, a) => a.indexOf(v) === i);
        return mrepoConfig.workspace.packages.filter((p) => util_1.isIn(p.name, allPackages)).map((p) => p.name);
    }
    static exit(msg) {
        utils_1.logger.error(AvailableCommands.DIGEST, msg);
        process.exit(1);
    }
    static uniqArr(arr) {
        return arr.filter((v, i, a) => a.indexOf(v) === i);
    }
}
exports.DigestCommand = DigestCommand;
//# sourceMappingURL=digest.command.js.map