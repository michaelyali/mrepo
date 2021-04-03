"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path_1 = require("path");
const color = require("chalk");
const emoji = require("node-emoji");
const constants_1 = require("../constants");
const helpers_1 = require("../helpers");
const utils_1 = require("../utils");
const PACKAGE_REGISTRY_CHOICES = [
    {
        name: constants_1.PACKAGE_REGISTRY.github,
        checked: true,
    },
    {
        name: constants_1.PACKAGE_REGISTRY.npm,
    },
];
const cwd = process.cwd();
const parentOptions = helpers_1.getParentProcessPassedOptions(process);
const monorepoPath = path_1.join(cwd, `./${parentOptions.name}`);
const templateDir = path_1.join(__dirname, '../templates/monorepo-generator');
const defaultAnswers = {
    monorepoName: parentOptions.name,
    workspaceName: 'packages',
    scope: '',
    pgDefaultsAccess: 'restricted',
    pgDefaultsLicense: 'MIT',
    pgDefaultsAuthorName: '',
    pgDefaultsAuthorEmail: '',
    currentYear: new Date().getFullYear(),
    packageRegistry: constants_1.PACKAGE_REGISTRY.github,
    shouldGeneratePackage: false,
    firstPackageName: '',
    registryUrl: constants_1.PACKAGE_REGISTRY_URL.github,
    githubNodeAuthTokenName: constants_1.GITHUB_NODE_AUTH_TOKEN_NAME.github,
};
const folderExists = fs_1.existsSync(monorepoPath);
if (folderExists) {
    const msg = `${emoji.get(':flushed:')} Folder ${color.bold.magentaBright(parentOptions.name)} already exists`;
    utils_1.logger.error('cli', msg);
    throw new Error(msg);
}
const result = {
    prompts() {
        const prompts = [];
        prompts.push({
            name: 'scope',
            message: 'Packages scope:',
            default: defaultAnswers.monorepoName,
            validate: validateNotEmpty,
        });
        if (parentOptions.useDefaults) {
            return prompts;
        }
        prompts.push({
            name: 'workspaceName',
            message: 'Packages folder:',
            default: defaultAnswers.workspaceName,
            validate: validateNotEmpty,
        });
        prompts.push({
            name: 'pgDefaultsAccess',
            message: 'Packages access:',
            default: defaultAnswers.pgDefaultsAccess,
            validate: validateNotEmpty,
        });
        prompts.push({
            name: 'pgDefaultsLicense',
            message: 'Packages license:',
            default: defaultAnswers.pgDefaultsLicense,
            validate: validateNotEmpty,
        });
        prompts.push({
            name: 'pgDefaultsAuthorName',
            message: 'Author`s name:',
            validate: validateNotEmpty,
        });
        prompts.push({
            name: 'pgDefaultsAuthorEmail',
            message: 'Author`s email:',
            validate: validateNotEmpty,
        });
        prompts.push({
            name: 'packageRegistry',
            type: 'list',
            message: 'Choose packages registry:',
            choices: PACKAGE_REGISTRY_CHOICES,
        });
        if (!parentOptions.dryRun) {
            prompts.push({
                name: 'shouldGeneratePackage',
                message: 'Generate first package?',
                type: 'confirm',
                default: defaultAnswers.shouldGeneratePackage,
            });
            prompts.push({
                name: 'firstPackageName',
                message: 'First package name:',
                validate: validateNotEmpty,
                when: (answers) => answers.shouldGeneratePackage,
            });
        }
        return prompts;
    },
    actions() {
        this.answers.monorepoName = defaultAnswers.monorepoName;
        this.answers.currentYear = defaultAnswers.currentYear;
        this.sao.opts.outDir = monorepoPath;
        if (parentOptions.useDefaults) {
            this.answers.workspaceName = defaultAnswers.workspaceName;
            this.answers.pgDefaultsAccess = defaultAnswers.pgDefaultsAccess;
            this.answers.pgDefaultsLicense = defaultAnswers.pgDefaultsLicense;
            this.answers.pgDefaultsAuthorName = defaultAnswers.pgDefaultsAuthorName;
            this.answers.pgDefaultsAuthorEmail = defaultAnswers.pgDefaultsAuthorEmail;
            this.answers.packageRegistry = defaultAnswers.packageRegistry;
            this.answers.shouldGeneratePackage = defaultAnswers.shouldGeneratePackage;
            this.answers.registryUrl = defaultAnswers.registryUrl;
            this.answers.githubNodeAuthTokenName = defaultAnswers.githubNodeAuthTokenName;
        }
        this.answers.registryUrl =
            this.answers.packageRegistry === constants_1.PACKAGE_REGISTRY.github ? constants_1.PACKAGE_REGISTRY_URL.github : constants_1.PACKAGE_REGISTRY_URL.npm;
        this.answers.githubNodeAuthTokenName =
            this.answers.packageRegistry === constants_1.PACKAGE_REGISTRY.github
                ? constants_1.GITHUB_NODE_AUTH_TOKEN_NAME.github
                : constants_1.GITHUB_NODE_AUTH_TOKEN_NAME.npm;
        if (parentOptions.dryRun) {
            return [];
        }
        fs_1.mkdirSync(monorepoPath, '0744');
        return [
            {
                type: 'add',
                files: '**',
                templateDir,
            },
            {
                type: 'move',
                patterns: {
                    packagesGitKeep: `${this.answers.workspaceName}/.gitkeep`,
                    e2eGitKeep: 'e2e/.gitkeep',
                    gitignore: '.gitignore',
                    prettierrc: '.prettierrc',
                    yarnrc: '.yarnrc',
                    eslintignore: '.eslintignore',
                    npmrc: '.npmrc',
                    'pre-commit': '.husky/pre-commit',
                    'eslintrc.js': '.eslintrc.js',
                    'githubWorkflowsTest.yml': '.github/workflows/test.yml',
                },
            },
        ];
    },
    completed() {
        if (!parentOptions.dryRun) {
            if (!parentOptions.skipScripts) {
                if (!parentOptions.skipInstall) {
                    utils_1.logger.info('cli', 'installing dependencies');
                    child_process_1.execSync(`cd ${monorepoPath} && npm i lerna@3.22.1 && npm run boot && npx rimraf ./package-lock.json`, {
                        stdio: 'inherit',
                    });
                    child_process_1.execSync(`cd ${monorepoPath} && chmod +x .husky/pre-commit`);
                }
                if (!parentOptions.skipGit) {
                    utils_1.logger.info('cli', 'git init');
                    child_process_1.execSync(`cd ${monorepoPath} && git init && git checkout -b main`);
                    if (!parentOptions.skipGitCommit) {
                        child_process_1.execSync(`cd ${monorepoPath} && git add . && git commit -m "chore: initial commit" --no-verify`);
                    }
                }
            }
            if (this.answers.firstPackageName) {
                child_process_1.execSync(`cd ${monorepoPath} && mrepo g ${this.answers.firstPackageName} -y`, {
                    stdio: 'inherit',
                });
            }
        }
    },
};
function validateNotEmpty(v) {
    return !!v;
}
module.exports = result;
//# sourceMappingURL=saofile.js.map