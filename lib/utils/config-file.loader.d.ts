import { IMrepoConfigFile } from '../interfaces';
export declare function loadConfigFile(path?: string): IMrepoConfigFile;
export declare function loadLernaFile(): any;
export declare function loadRootPackageJson(): any;
export declare function validateConfigFile(configFile: IMrepoConfigFile): void;
