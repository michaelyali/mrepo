"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParentProcessPassedOptions = exports.createChildProcessPassedOptionsString = void 0;
const constants_1 = require("../constants");
function createChildProcessPassedOptionsString(answers) {
    const base64 = Buffer.from(JSON.stringify(answers), 'utf-8').toString('base64');
    return `${constants_1.PACKAGE_GENERATOR_PASSED_OPTIONS_ENV_VAR}="${base64}"`;
}
exports.createChildProcessPassedOptionsString = createChildProcessPassedOptionsString;
function getParentProcessPassedOptions(proc) {
    const base64 = proc.env[constants_1.PACKAGE_GENERATOR_PASSED_OPTIONS_ENV_VAR];
    const str = Buffer.from(base64, 'base64').toString('utf-8');
    return JSON.parse(str);
}
exports.getParentProcessPassedOptions = getParentProcessPassedOptions;
//# sourceMappingURL=parent-child-process-options.helper.js.map