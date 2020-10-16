"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = require("./internal/core/errors");
exports.HardhatPluginError = errors_1.HardhatPluginError;
exports.NomicLabsHardhatPluginError = errors_1.NomicLabsHardhatPluginError;
var lazy_1 = require("./internal/util/lazy");
exports.lazyObject = lazy_1.lazyObject;
exports.lazyFunction = lazy_1.lazyFunction;
var constants_1 = require("./internal/constants");
exports.HARDHAT_NETWORK_NAME = constants_1.HARDHAT_NETWORK_NAME;
//# sourceMappingURL=plugins.js.map