import { DIGEST_MODE } from '../constants';
export interface IMrepoDigestConfigFilePath {
    name: string;
    path: string;
}
export interface IMrepoDigestConfigFileMrepoTarget {
    name: string;
    packages?: string[];
    noDefaultPackages?: boolean;
    mode?: DIGEST_MODE;
}
export interface IMrepoDigestConfigFileMrepo {
    name: string;
    defaultPackages?: string[];
    targets?: IMrepoDigestConfigFileMrepoTarget[];
}
export interface IMrepoDigestConfigFileTarget {
    name: string;
    installExec: string;
}
export interface IMrepoDigestConfigFile {
    paths: IMrepoDigestConfigFilePath[];
    mrepos: IMrepoDigestConfigFileMrepo[];
    targets: IMrepoDigestConfigFileTarget[];
    mode?: DIGEST_MODE;
}
