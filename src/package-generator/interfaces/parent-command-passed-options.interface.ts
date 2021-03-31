export interface IParentCommandPassedOptions {
  packageName?: string;
  useDefaults: boolean;
  dryRun: boolean;
  dependencies?: string;
  dependents?: string;
}
