export interface IPackageGeneratorAnswers {
  packageName?: string;
  packageScope?: string;
  access?: string;
  license?: string;
  authorName?: string;
  authorEmail?: string;
  dependencies?: string[];
  dependents?: string[];
}
