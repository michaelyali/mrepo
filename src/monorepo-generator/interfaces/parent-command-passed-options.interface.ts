export interface IParentCommandPassedOptions {
  name: string;
  useDefaults: boolean;
  dryRun: boolean;
  skipScripts: boolean;
  skipGit: boolean;
  skipGitCommit: boolean;
  skipInstall: boolean;
}
