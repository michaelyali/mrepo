"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("@nestled/util");
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path_1 = require("path");
const constants_1 = require("../constants");
const helpers_1 = require("../helpers");
const utils_1 = require("../utils");
const cwd = process.cwd();
const templateDir = path_1.join(__dirname, '../templates/package-generator');
const getInstallPath = (path) => path_1.join(cwd, `./${configFile.workspace.name}/${path}`);
const validatePackageName = (v) => !!v && !fs_1.existsSync(getInstallPath(v));
const configFile = utils_1.loadConfigFile();
const scopePackages = getScopePackages();
const parentOptions = helpers_1.getParentProcessPassedOptions(process);
const mergedDefaultOptions = mergeDefaultOptions();
const hasSubGenerators = util_1.isArrayFull((_a = configFile.packageGenerator) === null || _a === void 0 ? void 0 : _a.subGenerators);
function mergeDefaultOptions() {
    var _a;
    const configDefaults = ((_a = configFile.packageGenerator) === null || _a === void 0 ? void 0 : _a.defaultOptions) || {};
    const { dependencies, dependents } = mergeScopeDepsOptions();
    return {
        access: configDefaults.access ? configDefaults.access : 'restricted',
        license: configDefaults.license ? configDefaults.license : 'MIT',
        authorEmail: configDefaults.authorEmail ? configDefaults.authorEmail : '',
        authorName: configDefaults.authorName ? configDefaults.authorName : '',
        updateTsconfig: !util_1.isUndefined(configDefaults.updateTsconfig) ? !!configDefaults.updateTsconfig : true,
        subGenerators: util_1.isArrayFull(configDefaults.subGenerators) ? configDefaults.subGenerators : [],
        registryUrl: configFile.workspace.registry === constants_1.PACKAGE_REGISTRY.github
            ? constants_1.PACKAGE_REGISTRY_URL.github
            : constants_1.PACKAGE_REGISTRY_URL.npm,
        dependencies,
        dependents,
    };
}
function getScopePackages() {
    return configFile.workspace.packages.map((p) => p.name) || [];
}
function mergeScopeDepsOptions() {
    const dependencies = parentOptions.dependencies ? parentOptions.dependencies.split(',') : [];
    const dependents = parentOptions.dependents ? parentOptions.dependents.split(',') : [];
    return { dependencies, dependents };
}
function getDepsChoices(type) {
    return scopePackages.map((pkgName, i) => {
        const choice = { name: pkgName };
        if (util_1.isArrayFull(mergedDefaultOptions[type])) {
            choice.checked = mergedDefaultOptions[type].some((d) => d === pkgName);
        }
        return choice;
    });
}
const result = {
    prompts() {
        var _a;
        const prompts = [];
        if (!parentOptions.packageName) {
            prompts.push({
                name: 'packageName',
                message: 'Package name:',
                validate: validatePackageName,
            });
        }
        if (parentOptions.useDefaults) {
            return prompts;
        }
        prompts.push({
            name: 'access',
            message: 'Access type:',
            default: mergedDefaultOptions.access,
        });
        prompts.push({
            name: 'license',
            message: 'License:',
            default: mergedDefaultOptions.license,
        });
        prompts.push({
            name: 'authorName',
            message: 'Author`s name:',
            default: mergedDefaultOptions.authorName,
        });
        prompts.push({
            name: 'authorEmail',
            message: 'Author`s email:',
            default: mergedDefaultOptions.authorEmail,
        });
        prompts.push({
            name: 'updateTsconfig',
            type: 'confirm',
            message: 'Update tsconfig.json references?',
            default: mergedDefaultOptions.updateTsconfig,
        });
        if (util_1.isArrayFull(scopePackages)) {
            prompts.push({
                type: 'checkbox',
                name: 'dependencies',
                message: 'Dependencies:',
                choices: getDepsChoices('dependencies'),
            });
            prompts.push({
                type: 'checkbox',
                name: 'dependents',
                message: 'Dependents:',
                choices: (answers) => getDepsChoices('dependents').filter((choice) => !answers.dependencies.some((d) => d === choice.name)),
            });
        }
        if (hasSubGenerators) {
            const subGeneratorsChoices = (_a = configFile.packageGenerator) === null || _a === void 0 ? void 0 : _a.subGenerators.map((g, i) => {
                const choice = { name: g.name };
                if (util_1.isArrayFull(mergedDefaultOptions.subGenerators)) {
                    choice.checked = mergedDefaultOptions.subGenerators.some((s) => s === g.name);
                }
                else if (i === 0) {
                    choice.checked = true;
                }
                return choice;
            });
            if (!util_1.isArrayFull(mergedDefaultOptions.subGenerators)) {
                prompts.push({
                    type: 'checkbox',
                    name: 'selectedSubGenerators',
                    message: 'Select sub-generators',
                    choices: subGeneratorsChoices,
                });
            }
        }
        return prompts;
    },
    actions() {
        var _a, _b;
        this.answers.packageName = this.answers.packageName ? this.answers.packageName : parentOptions.packageName;
        this.answers.scope = configFile.workspace.scope;
        this.answers.registryUrl = mergedDefaultOptions.registryUrl;
        this.sao.opts.outDir = getInstallPath(this.answers.packageName);
        if (parentOptions.useDefaults) {
            this.answers.access = mergedDefaultOptions.access;
            this.answers.license = mergedDefaultOptions.license;
            this.answers.authorName = mergedDefaultOptions.authorName;
            this.answers.authorEmail = mergedDefaultOptions.authorEmail;
            this.answers.updateTsconfig = mergedDefaultOptions.updateTsconfig;
            this.answers.selectedSubGenerators = (_b = (_a = configFile.packageGenerator) === null || _a === void 0 ? void 0 : _a.subGenerators) === null || _b === void 0 ? void 0 : _b.filter((cg) => mergedDefaultOptions.subGenerators.some((mg) => mg === cg.name)).map((g) => g.name);
            this.answers.dependencies = mergedDefaultOptions.dependencies;
            this.answers.dependents = mergedDefaultOptions.dependents;
        }
        if (parentOptions.dryRun) {
            return [];
        }
        return [
            {
                type: 'add',
                files: '**',
                templateDir,
            },
            {
                type: 'move',
                patterns: {
                    npmrc: `.npmrc`,
                },
            },
        ];
    },
    completed() {
        var _a;
        if (parentOptions.dryRun) {
            utils_1.logger.info('cli', 'dry run');
        }
        else {
            utils_1.logger.info('cli', `updating ${constants_1.CONFIG_FILE_NAME}`);
            child_process_1.execSync(`npx json -I -f ${cwd}/${constants_1.CONFIG_FILE_NAME} -e "this.workspace.packages=[...this.workspace.packages, {'name': '${this.answers.packageName}'}]"`);
            if (this.answers.updateTsconfig) {
                utils_1.logger.info('cli', `updating tsconfig.json references`);
                child_process_1.execSync(`npx json -I -f ${cwd}/tsconfig.json -e "this.compilerOptions['paths']['@${this.answers.scope}/${this.answers.packageName}']=['${this.answers.packageName}/src']"`);
                child_process_1.execSync(`npx json -I -f ${cwd}/tsconfig.json -e "this.compilerOptions['paths']['@${this.answers.scope}/${this.answers.packageName}/*']=['${this.answers.packageName}/src/*']"`);
                child_process_1.execSync(`npx json -I -f ${cwd}/tsconfig.json -e "this.references=[...this.references, {'path': '${this.answers.packageName}'}]"`);
            }
            if (util_1.isArrayFull(this.answers.dependencies)) {
                utils_1.logger.info('cli', `updating dependencies references`);
                this.answers.dependencies.forEach((dep) => {
                    const filePath = `${cwd}/${configFile.workspace.name}/${this.answers.packageName}/tsconfig.json`;
                    child_process_1.execSync(`
            npx json -I -f ${filePath} -e "this.references=[...this.references, {'path': '../${dep}'}]"
          `);
                    child_process_1.execSync(`npx prettier --write ${filePath}`);
                });
            }
            if (util_1.isArrayFull(this.answers.dependents)) {
                utils_1.logger.info('cli', `updating dependents references`);
                this.answers.dependents.forEach((dep) => {
                    const filePath = `${cwd}/${configFile.workspace.name}/${dep}/tsconfig.json`;
                    child_process_1.execSync(`
            npx json -I -f ${filePath} -e "this.references=[...this.references, {'path': '../${this.answers.packageName}'}]"
          `);
                    child_process_1.execSync(`npx prettier --write ${filePath}`);
                });
            }
            if (util_1.isArrayFull(this.answers.selectedSubGenerators)) {
                const fromConfig = (_a = configFile.packageGenerator) === null || _a === void 0 ? void 0 : _a.subGenerators.filter((one) => this.answers.selectedSubGenerators.some((selected) => selected === one.name));
                fromConfig.forEach((config) => {
                    const path = path_1.join(cwd, config.path);
                    const envVar = helpers_1.createChildProcessPassedOptionsString(this.answers);
                    utils_1.logger.info('cli', `Running '${config.name}' sub-generator`);
                    child_process_1.execSync(`${envVar} sao ${path}`, { stdio: 'inherit' });
                });
            }
            utils_1.logger.info('cli', `running prettier`);
            child_process_1.execSync(`npx prettier --write ${cwd}/${constants_1.CONFIG_FILE_NAME} ${cwd}/tsconfig.json`);
        }
    },
};
module.exports = result;
//# sourceMappingURL=saofile.js.map