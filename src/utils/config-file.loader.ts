import { safeRequire } from '@nestled/util';
import Ajv from 'ajv';
import * as color from 'chalk';
import * as emoji from 'node-emoji';
import { join } from 'path';
import { CONFIG_FILE_NAME } from '../constants';
import { IMrepoConfigFile } from '../interfaces';
import { logger } from '../utils';

export function loadConfigFile(): IMrepoConfigFile {
  const configFilePath = join(process.cwd(), `./${CONFIG_FILE_NAME}`);
  return safeRequire(configFilePath);
}

export function loadLernaFile(): any {
  const lernaFilePath = join(process.cwd(), `./lerna.json`);
  return safeRequire(lernaFilePath);
}

export function loadRootPackageJson(): any {
  const packageJsonPath = join(process.cwd(), `./package.json`);
  return safeRequire(packageJsonPath);
}

export function validateConfigFile(configFile: IMrepoConfigFile) {
  if (!configFile) {
    const msg = `${emoji.get(':flushed:')} ${CONFIG_FILE_NAME} hasn't been found in project root`;
    logger.error('cli', msg);

    throw new Error(msg);
  }

  const ajv = new Ajv();
  const schema = {
    type: 'object',
    properties: {
      workspace: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          scope: { type: 'string' },
          registry: { type: 'string' },
          packages: {
            type: 'array',
            minItems: 0,
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
              },
              required: ['name'],
              additionalProperties: false,
            },
          },
        },
        required: ['name', 'scope', 'packages'],
        additionalProperties: false,
      },
      packageGenerator: {
        type: 'object',
        properties: {
          subGenerators: {
            type: 'array',
            minItems: 0,
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                path: { type: 'string' },
              },
              required: ['name', 'path'],
              additionalProperties: false,
            },
          },
          defaultOptions: {
            type: 'object',
            properties: {
              access: { type: 'string' },
              license: { type: 'string' },
              authorName: { type: 'string' },
              authorEmail: { type: 'string' },
              updateTsconfig: { type: 'boolean' },
              subGenerators: {
                type: 'array',
                minItems: 0,
                items: { type: 'string' },
              },
              dependencies: {
                type: 'array',
                minItems: 0,
                items: { type: 'string' },
              },
            },
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      },
    },
    required: ['workspace'],
    additionalProperties: false,
  };
  const validate = ajv.compile<IMrepoConfigFile>(schema);
  const isValid = validate(configFile);

  if (!isValid) {
    const { dataPath, message } = validate.errors[0];
    const msg1 = `${emoji.get(':flushed:')} Invalid ${CONFIG_FILE_NAME}`;
    const msg2 = `${color.bold.red(dataPath)} -> ${color.bold.red(message)}`;
    logger.error('cli', msg1);
    logger.error('cli', msg2);

    throw new Error(`${msg1}: ${msg2}`);
  }
}
