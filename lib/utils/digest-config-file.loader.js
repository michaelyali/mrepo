"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadDigestConfigFile = void 0;
const util_1 = require("@nestled/util");
const ajv_1 = require("ajv");
const color = require("chalk");
const findConfig = require("find-config");
const emoji = require("node-emoji");
const constants_1 = require("../constants");
const utils_1 = require("../utils");
function loadDigestConfigFile(configFileName = constants_1.DIGEST_CONFIG_FILE_NAME) {
    const path = findConfig(configFileName);
    if (!path) {
        const msg = `${emoji.get(':flushed:')} ${configFileName} hasn't been found`;
        utils_1.logger.error('cli', msg);
        process.exit(1);
    }
    const loadedConfigFile = util_1.safeRequire(path);
    validateDigestConfigFile(loadedConfigFile, configFileName);
    return loadedConfigFile;
}
exports.loadDigestConfigFile = loadDigestConfigFile;
function validateDigestConfigFile(loadedConfigFile, configFileName) {
    const ajv = new ajv_1.default();
    const schema = {
        type: 'object',
        properties: {
            mode: {
                type: 'string',
                pattern: constants_1.DIGEST_MODE_LIST.join('|'),
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
                                        pattern: constants_1.DIGEST_MODE_LIST.join('|'),
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
    const validate = ajv.compile(schema);
    const isValid = validate(loadedConfigFile);
    if (!isValid) {
        const { dataPath, message } = validate.errors[0];
        const msg1 = `${emoji.get(':flushed:')} Invalid ${configFileName}`;
        const msg2 = `${color.bold.red(dataPath)} -> ${color.bold.red(message)}`;
        utils_1.logger.error('cli', msg1);
        utils_1.logger.error('cli', msg2);
        process.exit(1);
    }
}
//# sourceMappingURL=digest-config-file.loader.js.map