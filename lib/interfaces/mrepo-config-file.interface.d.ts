import { IPackageGeneratorAnswers } from '../package-generator/interfaces';
export interface IMrepoConfigFile {
    workspace: {
        name: string;
        scope: string;
        registry: string;
        packages: Array<{
            name: string;
        }>;
    };
    packageGenerator?: {
        subGenerators?: Array<{
            name: string;
            path: string;
        }>;
        defaultOptions?: {
            updateTsconfig?: boolean;
            subGenerators?: string[];
        } & Omit<IPackageGeneratorAnswers, 'packageScope' | 'packageName' | 'dependents'>;
    };
}
