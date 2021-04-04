"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPackagesNpmrc = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const constants_1 = require("../constants");
const config_file_loader_1 = require("./config-file.loader");
function createPackagesNpmrc(authToken) {
    var _a;
    const configFile = config_file_loader_1.loadConfigFile();
    const registryUrl = configFile.workspace.registry === constants_1.PACKAGE_REGISTRY.github ? constants_1.PACKAGE_REGISTRY_URL.github : constants_1.PACKAGE_REGISTRY_URL.npm;
    const packagesNames = (_a = configFile.workspace.packages) === null || _a === void 0 ? void 0 : _a.map((pkg) => pkg.name);
    packagesNames.forEach((name) => {
        const path = path_1.join(process.cwd(), `./${configFile.workspace.name}/${name}/.npmrc`);
        const content = `@${configFile.workspace.scope}:registry=https://${registryUrl}\n//${registryUrl}/:_authToken=${authToken}`;
        fs_1.writeFileSync(path, content, { encoding: 'utf8' });
    });
}
exports.createPackagesNpmrc = createPackagesNpmrc;
//# sourceMappingURL=create-packages-npmrc.util.js.map