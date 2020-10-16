"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const types = __importStar(require("./argumentTypes"));
exports.HARDHAT_PARAM_DEFINITIONS = {
    network: {
        name: "network",
        defaultValue: undefined,
        description: "The network to connect to.",
        type: types.string,
        isOptional: true,
        isFlag: false,
        isVariadic: false,
    },
    showStackTraces: {
        name: "showStackTraces",
        defaultValue: false,
        description: "Show stack traces.",
        type: types.boolean,
        isFlag: true,
        isOptional: true,
        isVariadic: false,
    },
    version: {
        name: "version",
        defaultValue: false,
        description: "Shows hardhat's version.",
        type: types.boolean,
        isFlag: true,
        isOptional: true,
        isVariadic: false,
    },
    help: {
        name: "help",
        defaultValue: false,
        description: "Shows this message, or a task's help if its name is provided",
        type: types.boolean,
        isFlag: true,
        isOptional: true,
        isVariadic: false,
    },
    emoji: {
        name: "emoji",
        defaultValue: process.platform === "darwin",
        description: "Use emoji in messages.",
        type: types.boolean,
        isFlag: true,
        isOptional: true,
        isVariadic: false,
    },
    config: {
        name: "config",
        defaultValue: undefined,
        description: "A Hardhat config file.",
        type: types.inputFile,
        isFlag: false,
        isOptional: true,
        isVariadic: false,
    },
    verbose: {
        name: "verbose",
        defaultValue: false,
        description: "Enables Hardhat verbose logging",
        type: types.boolean,
        isFlag: true,
        isOptional: true,
        isVariadic: false,
    },
    maxMemory: {
        name: "maxMemory",
        defaultValue: undefined,
        description: "The maximum amount of memory that Hardhat can use.",
        type: types.int,
        isOptional: true,
        isFlag: false,
        isVariadic: false,
    },
};
//# sourceMappingURL=hardhat-params.js.map