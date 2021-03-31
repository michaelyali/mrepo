import { CommanderStatic } from 'commander';
import { IMrepoConfigFile } from '../interfaces';
export declare class ScriptsGeneratorCommand {
    static load(program: CommanderStatic['program'], configFile: IMrepoConfigFile): void;
}
