"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveCache = exports.hasCached = void 0;
const util_1 = require("@nestled/util");
const folder_hash_1 = require("folder-hash");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const constants_1 = require("../constants");
const TMP_BUILDS_CACHE_FILE_PATH = path_1.join(process.cwd(), constants_1.TMP_FOLDER_NAME, constants_1.TMP_BUILDS_CACHE_FILE_NAME);
async function hasCached(workspaceName, packageName) {
    const cacheFile = await ensureBuildsCacheFile();
    const savedCache = cacheFile[packageName] || {};
    const paths = getPaths(workspaceName, packageName);
    const hashes = await getHashes(paths);
    return savedCache.src === hashes.src && savedCache.lib === hashes.lib && util_1.isString(hashes.lib);
}
exports.hasCached = hasCached;
async function saveCache(workspaceName, packageName) {
    const cacheFile = await ensureBuildsCacheFile();
    const paths = getPaths(workspaceName, packageName);
    const hashes = await getHashes(paths);
    await fs_extra_1.writeJson(TMP_BUILDS_CACHE_FILE_PATH, {
        ...cacheFile,
        [packageName]: hashes,
    });
}
exports.saveCache = saveCache;
function getPaths(workspaceName, packageName) {
    const packagePath = path_1.join(process.cwd(), workspaceName, packageName);
    const src = path_1.join(packagePath, 'src');
    const lib = path_1.join(packagePath, 'lib');
    return { src, lib };
}
async function ensureBuildsCacheFile() {
    await fs_extra_1.ensureFile(TMP_BUILDS_CACHE_FILE_PATH);
    const buildsCacheFile = await fs_extra_1.readJson(TMP_BUILDS_CACHE_FILE_PATH, { throws: false });
    if (!buildsCacheFile) {
        await fs_extra_1.writeJson(TMP_BUILDS_CACHE_FILE_PATH, {});
        return {};
    }
    return buildsCacheFile;
}
async function getOneHash(path) {
    try {
        const hash = await folder_hash_1.hashElement(path);
        return hash === null || hash === void 0 ? void 0 : hash.hash;
    }
    catch (e) {
        return undefined;
    }
}
async function getHashes(paths) {
    const [src, lib] = await Promise.all([getOneHash(paths.src), await getOneHash(paths.lib)]);
    return { src, lib };
}
//# sourceMappingURL=hash-check.helper.js.map