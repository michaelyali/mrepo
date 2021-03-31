"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const color = require("chalk");
const log = require("npmlog");
const constants_1 = require("../constants");
log.heading = color.cyan(constants_1.CMD);
exports.logger = log;
//# sourceMappingURL=logger.js.map