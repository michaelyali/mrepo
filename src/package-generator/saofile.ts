import { isArrayFull, isUndefined } from '@nestled/util';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { CONFIG_FILE_NAME, PACKAGE_REGISTRY, PACKAGE_REGISTRY_URL } from '../constants';
import { IMrepoConfigFile } from '../interfaces';
import { createChildProcessPassedOptionsString, getParentProcessPassedOptions } from '../helpers';
import { loadConfigFile, loadRootPackageJson, logger } from '../utils';
import { IParentCommandPassedOptions } from './interfaces/parent-command-passed-options.interface';

// options
const cwd = process.cwd();
const templateDir = join(__dirname, '../templates/package-generator');
const getInstallPath = (path) => join(cwd, `./${configFile.workspace.name}/${path}`);
const validatePackageName = (v: string) => !!v && !existsSync(getInstallPath(v));
const configFile = loadConfigFile();
const rootPackageJson = loadRootPackageJson();
const scopePackages = getScopePackages();
const parentOptions = getParentProcessPassedOptions<IParentCommandPassedOptions>(process);
const mergedDefaultOptions = mergeDefaultOptions();
const hasSubGenerators = isArrayFull(configFile.packageGenerator?.subGenerators);

function mergeDefaultOptions(): IMrepoConfigFile['packageGenerator']['defaultOptions'] & { dependents: string[] } {
  const configDefaults: any = configFile.packageGenerator?.defaultOptions || {};
  const { dependencies, dependents } = mergeScopeDepsOptions();

  return {
    access: configDefaults.access ? configDefaults.access : 'restricted',
    license: configDefaults.license ? configDefaults.license : 'MIT',
    authorEmail: configDefaults.authorEmail ? configDefaults.authorEmail : '',
    authorName: configDefaults.authorName ? configDefaults.authorName : '',
    updateTsconfig: !isUndefined(configDefaults.updateTsconfig) ? !!configDefaults.updateTsconfig : true,
    subGenerators: isArrayFull(configDefaults.subGenerators) ? configDefaults.subGenerators : [],
    registryUrl:
      configFile.workspace.registry === PACKAGE_REGISTRY.github
        ? PACKAGE_REGISTRY_URL.github
        : PACKAGE_REGISTRY_URL.npm,
    dependencies,
    dependents,
  };
}

function getScopePackages(): string[] {
  return configFile.workspace.packages.map((p) => p.name) || [];
}

function mergeScopeDepsOptions(): { dependencies: string[]; dependents: string[] } {
  const dependencies = parentOptions.dependencies ? parentOptions.dependencies.split(',') : [];
  const dependents = parentOptions.dependents ? parentOptions.dependents.split(',') : [];

  return { dependencies, dependents };
}

function getDepsChoices(type: 'dependencies' | 'dependents'): Array<{ name: string; checked: boolean }> {
  return scopePackages.map((pkgName: string, i) => {
    const choice: any = { name: pkgName };

    if (isArrayFull(mergedDefaultOptions[type])) {
      choice.checked = mergedDefaultOptions[type].some((d) => d === pkgName);
    }

    return choice;
  });
}

const result = {
  prompts() {
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

    if (isArrayFull(scopePackages)) {
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
        choices: (answers) =>
          getDepsChoices('dependents').filter((choice) => !answers.dependencies.some((d) => d === choice.name)),
      });
    }

    if (hasSubGenerators) {
      const subGeneratorsChoices = configFile.packageGenerator?.subGenerators.map((g, i) => {
        const choice: any = { name: g.name };

        if (isArrayFull(mergedDefaultOptions.subGenerators)) {
          choice.checked = mergedDefaultOptions.subGenerators.some((s) => s === g.name);
        } else if (i === 0) {
          choice.checked = true;
        }

        return choice;
      });

      if (!isArrayFull(mergedDefaultOptions.subGenerators)) {
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
    this.answers.packageName = this.answers.packageName ? this.answers.packageName : parentOptions.packageName;
    this.answers.scope = configFile.workspace.scope;
    this.answers.registryUrl = mergedDefaultOptions.registryUrl;
    this.answers.repository = rootPackageJson.repository;
    this.sao.opts.outDir = getInstallPath(this.answers.packageName);

    if (parentOptions.useDefaults) {
      this.answers.access = mergedDefaultOptions.access;
      this.answers.license = mergedDefaultOptions.license;
      this.answers.authorName = mergedDefaultOptions.authorName;
      this.answers.authorEmail = mergedDefaultOptions.authorEmail;
      this.answers.updateTsconfig = mergedDefaultOptions.updateTsconfig;
      this.answers.selectedSubGenerators = configFile.packageGenerator?.subGenerators
        ?.filter((cg) => mergedDefaultOptions.subGenerators.some((mg) => mg === cg.name))
        .map((g) => g.name);
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
          'noop.spec.ts': 'test/noop.spec.ts',
          'srcIndex.ts': 'src/index.ts',
          packageLICENSE: 'LICENSE',
          packageJson: 'package.json',
        },
      },
    ];
  },
  completed() {
    if (parentOptions.dryRun) {
      logger.info('cli', 'dry run');
    } else {
      // update mrepo.json
      logger.info('cli', `updating ${CONFIG_FILE_NAME}`);
      execSync(
        `npx json -I -f ${cwd}/${CONFIG_FILE_NAME} -e "this.workspace.packages=[...this.workspace.packages, {'name': '${this.answers.packageName}'}]"`,
      );

      // update tsconfig.json
      if (this.answers.updateTsconfig) {
        logger.info('cli', `updating tsconfig.json references`);
        execSync(
          `npx json -I -f ${cwd}/tsconfig.json -e "this.compilerOptions['paths']['@${this.answers.scope}/${this.answers.packageName}']=['${this.answers.packageName}/src']"`,
        );
        execSync(
          `npx json -I -f ${cwd}/tsconfig.json -e "this.compilerOptions['paths']['@${this.answers.scope}/${this.answers.packageName}/*']=['${this.answers.packageName}/src/*']"`,
        );
        execSync(
          `npx json -I -f ${cwd}/tsconfig.json -e "this.references=[...this.references, {'path': '${this.answers.packageName}'}]"`,
        );
      }

      if (isArrayFull(this.answers.dependencies)) {
        logger.info('cli', `updating dependencies references`);
        this.answers.dependencies.forEach((dep: string) => {
          const filePath = `${cwd}/${configFile.workspace.name}/${this.answers.packageName}/tsconfig.json`;
          execSync(`
            npx json -I -f ${filePath} -e "this.references=[...this.references, {'path': '../${dep}'}]"
          `);
          execSync(`npx prettier --write ${filePath}`);
        });
      }

      if (isArrayFull(this.answers.dependents)) {
        logger.info('cli', `updating dependents references`);
        this.answers.dependents.forEach((dep: string) => {
          const filePath = `${cwd}/${configFile.workspace.name}/${dep}/tsconfig.json`;
          execSync(`
            npx json -I -f ${filePath} -e "this.references=[...this.references, {'path': '../${this.answers.packageName}'}]"
          `);
          execSync(`npx prettier --write ${filePath}`);
        });
      }

      // run sub-generators
      if (isArrayFull(this.answers.selectedSubGenerators)) {
        const fromConfig = configFile.packageGenerator?.subGenerators.filter((one) =>
          this.answers.selectedSubGenerators.some((selected) => selected === one.name),
        );

        fromConfig.forEach((config) => {
          const path = join(cwd, config.path);
          const envVar = createChildProcessPassedOptionsString(this.answers);
          logger.info('cli', `Running '${config.name}' sub-generator`);
          execSync(`${envVar} sao ${path}`, { stdio: 'inherit' });
        });
      }

      // prettier
      logger.info('cli', `running prettier`);
      execSync(`npx prettier --write ${cwd}/${CONFIG_FILE_NAME} ${cwd}/tsconfig.json`);
    }
  },
};

module.exports = result;
