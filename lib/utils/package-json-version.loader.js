"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadPackageJsonVersion = void 0;
function loadPackageJsonVersion(path) {
    const packageJson = require(path ? path : '../../package');
    return packageJson.version;
}
exports.loadPackageJsonVersion = loadPackageJsonVersion;
//# sourceMappingURL=package-json-version.loader.js.map