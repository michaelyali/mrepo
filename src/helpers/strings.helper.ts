import * as dashifyLib from 'dashify';

/**
 * Dashify a string
 *
 * @param str string
 * @returns string
 */
export const dashify = dashifyLib;

/**
 * Classify a string
 *
 * @param str string
 * @returns string
 */
export const classify = (str: string): string => {
  const dashed = dashify(str);
  return dashed.charAt(0).toUpperCase() + dashed.slice(1);
};
