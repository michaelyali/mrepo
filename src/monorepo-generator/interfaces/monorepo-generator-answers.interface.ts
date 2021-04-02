export interface IMonorepoGeneratorAnswers {
  monorepoName: string;
  scope: string;
  workspaceName: string;
  pgDefaultsAccess: string;
  pgDefaultsLicense: string;
  pgDefaultsAuthorName: string;
  pgDefaultsAuthorEmail: string;
  lernaPackageVersioning: string;
  publishPackageCommitMsg: string;
  currentYear: number;
  packageRegistry: string;
  shouldGeneratePackage: boolean;
  firstPackageName: string;
  registryUrl: string;
  githubNodeAuthTokenName: string;
}
