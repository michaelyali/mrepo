import { safeRequire } from '@nestled/util';
import Ajv from 'ajv';
import * as color from 'chalk';
import * as findConfig from 'find-config';
import * as emoji from 'node-emoji';
import { join } from 'path';
import { DIGEST_CONFIG_FILE_NAME, DIGEST_MODE, DIGEST_MODE_LIST } from '../constants';
import { IMrepoDigestConfigFile } from '../interfaces';
import { logger } from '../utils';

export function loadDigestConfigFile(configFileName = DIGEST_CONFIG_FILE_NAME): IMrepoDigestConfigFile {
  const path = findConfig(configFileName);

  if (!path) {
    const msg = `${emoji.get(':flushed:')} ${configFileName} hasn't been found`;
    logger.error('cli', msg);
    process.exit(1);
  }

  const loadedConfigFile = safeRequire<IMrepoDigestConfigFile>(path);

  validateDigestConfigFile(loadedConfigFile, configFileName);

  return loadedConfigFile;
}

function validateDigestConfigFile(loadedConfigFile: IMrepoDigestConfigFile, configFileName: string): void {
  const ajv = new Ajv();

  const schema = {
    type: 'object',
    properties: {
      mode: {
        type: 'string',
        pattern: DIGEST_MODE_LIST.join('|'),
      },
      paths: {
        type: 'array',
        minItems: 2,
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            path: { type: 'string' },
          },
          additionalProperties: false,
          required: ['name', 'path'],
        },
      },
      mrepos: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            targets: {
              type: 'array',
              minItems: 0,
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  packages: {
                    type: 'array',
                    minItems: 0,
                    items: { type: 'string' },
                  },
                  noDefaultPackages: { type: 'boolean' },
                  mode: {
                    type: 'string',
                    pattern: DIGEST_MODE_LIST.join('|'),
                  },
                },
                additionalProperties: false,
                required: ['name'],
              },
            },
            defaultPackages: {
              type: 'array',
              minItems: 0,
              items: { type: 'string' },
            },
          },
          additionalProperties: false,
          required: ['name'],
        },
      },
      targets: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            installExec: { type: 'string' },
          },
          additionalProperties: false,
          required: ['name', 'installExec'],
        },
      },
    },
    additionalProperties: false,
    required: ['paths', 'mrepos', 'targets'],
  };

  const validate = ajv.compile<IMrepoDigestConfigFile>(schema);
  const isValid = validate(loadedConfigFile);

  if (!isValid) {
    const { dataPath, message } = validate.errors[0];
    const msg1 = `${emoji.get(':flushed:')} Invalid ${configFileName}`;
    const msg2 = `${color.bold.red(dataPath)} -> ${color.bold.red(message)}`;
    logger.error('cli', msg1);
    logger.error('cli', msg2);
    process.exit(1);
  }
}
