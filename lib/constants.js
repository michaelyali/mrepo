"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GITHUB_NODE_AUTH_TOKEN_NAME = exports.PACKAGE_REGISTRY_URL = exports.PACKAGE_REGISTRY = exports.LERNA_PACKAGES_VERSIONING = exports.PACKAGE_GENERATOR_PASSED_OPTIONS_ENV_VAR = exports.CONFIG_FILE_NAME = exports.CMD = void 0;
exports.CMD = 'mrepo';
exports.CONFIG_FILE_NAME = `${exports.CMD}.json`;
exports.PACKAGE_GENERATOR_PASSED_OPTIONS_ENV_VAR = 'PACKAGE_GENERATOR_PASSED_OPTIONS';
var LERNA_PACKAGES_VERSIONING;
(function (LERNA_PACKAGES_VERSIONING) {
    LERNA_PACKAGES_VERSIONING["independent"] = "independent";
    LERNA_PACKAGES_VERSIONING["common"] = "common";
})(LERNA_PACKAGES_VERSIONING = exports.LERNA_PACKAGES_VERSIONING || (exports.LERNA_PACKAGES_VERSIONING = {}));
var PACKAGE_REGISTRY;
(function (PACKAGE_REGISTRY) {
    PACKAGE_REGISTRY["github"] = "github";
    PACKAGE_REGISTRY["npm"] = "npm";
})(PACKAGE_REGISTRY = exports.PACKAGE_REGISTRY || (exports.PACKAGE_REGISTRY = {}));
var PACKAGE_REGISTRY_URL;
(function (PACKAGE_REGISTRY_URL) {
    PACKAGE_REGISTRY_URL["github"] = "npm.pkg.github.com";
    PACKAGE_REGISTRY_URL["npm"] = "registry.npmjs.org";
})(PACKAGE_REGISTRY_URL = exports.PACKAGE_REGISTRY_URL || (exports.PACKAGE_REGISTRY_URL = {}));
var GITHUB_NODE_AUTH_TOKEN_NAME;
(function (GITHUB_NODE_AUTH_TOKEN_NAME) {
    GITHUB_NODE_AUTH_TOKEN_NAME["github"] = "GITHUB_TOKEN";
    GITHUB_NODE_AUTH_TOKEN_NAME["npm"] = "NPM_TOKEN";
})(GITHUB_NODE_AUTH_TOKEN_NAME = exports.GITHUB_NODE_AUTH_TOKEN_NAME || (exports.GITHUB_NODE_AUTH_TOKEN_NAME = {}));
//# sourceMappingURL=constants.js.map