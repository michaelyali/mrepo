import { CommanderStatic } from 'commander';
import { DIGEST_MODE } from '../constants';
import { IMrepoConfigFile, IMrepoDigestConfigFile, IMrepoDigestConfigFilePath, IMrepoDigestConfigFileMrepo, IMrepoDigestConfigFileMrepoTarget, IMrepoDigestConfigFileTarget } from '../interfaces';
interface DigestCommandOptions {
    config: string;
    mode: DIGEST_MODE;
    packages?: string;
    installVersion?: string;
    quiet?: boolean;
}
export declare class DigestCommand {
    static load(program: CommanderStatic['program']): void;
    static runDigest(from: string, to: string, options: DigestCommandOptions): Promise<void>;
    static removeFromNodeModules(mrepoConfig: IMrepoConfigFile, targetPath: IMrepoDigestConfigFilePath, digestPackages: string[]): void;
    static runInstall(mrepoConfig: IMrepoConfigFile, targetPath: IMrepoDigestConfigFilePath, target: IMrepoDigestConfigFileTarget, digestPackages: string[], options: DigestCommandOptions): void;
    static runSymlink(mrepoConfig: IMrepoConfigFile, mrepoPath: IMrepoDigestConfigFilePath, targetPath: IMrepoDigestConfigFilePath, digestPackages: string[]): Promise<void>;
    static getMode(config: IMrepoDigestConfigFile, mrepoTarget: IMrepoDigestConfigFileMrepoTarget, options: DigestCommandOptions): DIGEST_MODE;
    static getPathFromConfig(name: string, config: IMrepoDigestConfigFile, options: DigestCommandOptions): IMrepoDigestConfigFilePath;
    static getMreposFromConfig(from: string, config: IMrepoDigestConfigFile, options: DigestCommandOptions): IMrepoDigestConfigFileMrepo[];
    static getMrepoFromConfig(name: string, config: IMrepoDigestConfigFile, options: DigestCommandOptions): IMrepoDigestConfigFileMrepo;
    static getMrepoTargetFromConfig(mrepo: IMrepoDigestConfigFileMrepo, to: string): IMrepoDigestConfigFileMrepoTarget[];
    static getTargetFromConfig(name: string, config: IMrepoDigestConfigFile, options: DigestCommandOptions): IMrepoDigestConfigFileTarget;
    static loadMrepoConfigFile(name: string, path: string): IMrepoConfigFile;
    static getTargetDigestPackages(mrepo: IMrepoDigestConfigFileMrepo, mrepoTarget: IMrepoDigestConfigFileMrepoTarget, mrepoConfig: IMrepoConfigFile, options: DigestCommandOptions): string[];
    static exit(msg: string): void;
    static uniqArr(arr: any[]): any[];
}
export {};
