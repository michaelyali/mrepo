import * as color from 'chalk';
import * as log from 'npmlog';
import { CMD } from '../constants';

log.heading = color.cyan(CMD);

export const logger = log;
