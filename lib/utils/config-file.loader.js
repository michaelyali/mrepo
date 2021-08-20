"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateConfigFile = exports.loadRootPackageJson = exports.loadLernaFile = exports.loadConfigFile = void 0;
const util_1 = require("@nestled/util");
const ajv_1 = require("ajv");
const color = require("chalk");
const emoji = require("node-emoji");
const path_1 = require("path");
const constants_1 = require("../constants");
const utils_1 = require("../utils");
function loadConfigFile(path) {
    const configFilePath = path_1.join(path ? path : process.cwd(), `./${constants_1.CONFIG_FILE_NAME}`);
    return util_1.safeRequire(configFilePath);
}
exports.loadConfigFile = loadConfigFile;
function loadLernaFile() {
    const lernaFilePath = path_1.join(process.cwd(), `./lerna.json`);
    delete require.cache[lernaFilePath];
    return util_1.safeRequire(lernaFilePath);
}
exports.loadLernaFile = loadLernaFile;
function loadRootPackageJson() {
    const packageJsonPath = path_1.join(process.cwd(), `./package.json`);
    return util_1.safeRequire(packageJsonPath);
}
exports.loadRootPackageJson = loadRootPackageJson;
function validateConfigFile(configFile) {
    if (!configFile) {
        const msg = `${emoji.get(':flushed:')} ${constants_1.CONFIG_FILE_NAME} hasn't been found in project root`;
        utils_1.logger.error('cli', msg);
        throw new Error(msg);
    }
    const ajv = new ajv_1.default();
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
    const validate = ajv.compile(schema);
    const isValid = validate(configFile);
    if (!isValid) {
        const { dataPath, message } = validate.errors[0];
        const msg1 = `${emoji.get(':flushed:')} Invalid ${constants_1.CONFIG_FILE_NAME}`;
        const msg2 = `${color.bold.red(dataPath)} -> ${color.bold.red(message)}`;
        utils_1.logger.error('cli', msg1);
        utils_1.logger.error('cli', msg2);
        throw new Error(`${msg1}: ${msg2}`);
    }
}
exports.validateConfigFile = validateConfigFile;
//# sourceMappingURL=config-file.loader.js.map