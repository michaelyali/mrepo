"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DIGEST_MODE_LIST = exports.DIGEST_MODE_DISPLAY = exports.DIGEST_MODE = exports.GITHUB_NODE_AUTH_TOKEN_NAME = exports.PACKAGE_REGISTRY_URL = exports.PACKAGE_REGISTRY = exports.LERNA_PACKAGES_VERSIONING = exports.PACKAGE_GENERATOR_PASSED_OPTIONS_ENV_VAR = exports.TMP_FOLDER_NAME = exports.TMP_BUILDS_CACHE_FILE_NAME = exports.DIGEST_CONFIG_FILE_NAME = exports.CONFIG_FILE_NAME = exports.CMD = void 0;
exports.CMD = 'mrepo';
exports.CONFIG_FILE_NAME = `${exports.CMD}.json`;
exports.DIGEST_CONFIG_FILE_NAME = `${exports.CMD}-digest.json`;
exports.TMP_BUILDS_CACHE_FILE_NAME = 'builds.cache';
exports.TMP_FOLDER_NAME = '.mrepo';
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
var DIGEST_MODE;
(function (DIGEST_MODE) {
    DIGEST_MODE["LINK"] = "ln";
    DIGEST_MODE["INSTALL"] = "install";
    DIGEST_MODE["COPY"] = "copy";
})(DIGEST_MODE = exports.DIGEST_MODE || (exports.DIGEST_MODE = {}));
var DIGEST_MODE_DISPLAY;
(function (DIGEST_MODE_DISPLAY) {
    DIGEST_MODE_DISPLAY["ln"] = "symlink";
    DIGEST_MODE_DISPLAY["install"] = "install";
    DIGEST_MODE_DISPLAY["copy"] = "copy";
})(DIGEST_MODE_DISPLAY = exports.DIGEST_MODE_DISPLAY || (exports.DIGEST_MODE_DISPLAY = {}));
exports.DIGEST_MODE_LIST = Object.values(DIGEST_MODE);
//# sourceMappingURL=constants.js.map