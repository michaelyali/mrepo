import { CommanderStatic } from 'commander';
import { IMrepoConfigFile } from '../interfaces';
export declare class MainCommands {
    static load(program: CommanderStatic['program'], configFile: IMrepoConfigFile): void;
}
