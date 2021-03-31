"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classify = exports.dashify = void 0;
const dashifyLib = require("dashify");
exports.dashify = dashifyLib;
exports.classify = (str) => {
    const dashed = exports.dashify(str);
    return dashed.charAt(0).toUpperCase() + dashed.slice(1);
};
//# sourceMappingURL=strings.helper.js.map