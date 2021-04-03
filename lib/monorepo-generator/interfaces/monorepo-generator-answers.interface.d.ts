export interface IMonorepoGeneratorAnswers {
    monorepoName: string;
    scope: string;
    workspaceName: string;
    pgDefaultsAccess: string;
    pgDefaultsLicense: string;
    pgDefaultsAuthorName: string;
    pgDefaultsAuthorEmail: string;
    currentYear: number;
    packageRegistry: string;
    shouldGeneratePackage: boolean;
    firstPackageName: string;
    registryUrl: string;
    githubNodeAuthTokenName: string;
}
