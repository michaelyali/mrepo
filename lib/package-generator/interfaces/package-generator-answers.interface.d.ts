export interface IPackageGeneratorAnswers {
    packageName?: string;
    scope?: string;
    access?: string;
    license?: string;
    authorName?: string;
    authorEmail?: string;
    dependencies?: string[];
    dependents?: string[];
    registryUrl: string;
}
