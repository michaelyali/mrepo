export declare const CMD = "mrepo";
export declare const CONFIG_FILE_NAME: string;
export declare const DIGEST_CONFIG_FILE_NAME: string;
export declare const TMP_BUILDS_CACHE_FILE_NAME = "builds.cache";
export declare const TMP_FOLDER_NAME = ".mrepo";
export declare const PACKAGE_GENERATOR_PASSED_OPTIONS_ENV_VAR = "PACKAGE_GENERATOR_PASSED_OPTIONS";
export declare enum LERNA_PACKAGES_VERSIONING {
    independent = "independent",
    common = "common"
}
export declare enum PACKAGE_REGISTRY {
    github = "github",
    npm = "npm"
}
export declare enum PACKAGE_REGISTRY_URL {
    github = "npm.pkg.github.com",
    npm = "registry.npmjs.org"
}
export declare enum GITHUB_NODE_AUTH_TOKEN_NAME {
    github = "GITHUB_TOKEN",
    npm = "NPM_TOKEN"
}
export declare enum DIGEST_MODE {
    LINK = "ln",
    INSTALL = "install",
    COPY = "copy"
}
export declare enum DIGEST_MODE_DISPLAY {
    'ln' = "symlink",
    'install' = "install",
    'copy' = "copy"
}
export declare const DIGEST_MODE_LIST: DIGEST_MODE[];
