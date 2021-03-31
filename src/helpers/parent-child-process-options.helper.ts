import { PACKAGE_GENERATOR_PASSED_OPTIONS_ENV_VAR } from '../constants';

export function createChildProcessPassedOptionsString<T>(answers: T): string {
  const base64 = Buffer.from(JSON.stringify(answers), 'utf-8').toString('base64');

  return `${PACKAGE_GENERATOR_PASSED_OPTIONS_ENV_VAR}="${base64}"`;
}

/**
 * Get options passed from parent process
 *
 * @param proc NodeJS.Process
 * @returns IPackageGeneratorAnswers
 */
export function getParentProcessPassedOptions<T = any>(proc: NodeJS.Process): T {
  const base64 = proc.env[PACKAGE_GENERATOR_PASSED_OPTIONS_ENV_VAR];
  const str = Buffer.from(base64, 'base64').toString('utf-8');

  return JSON.parse(str);
}
