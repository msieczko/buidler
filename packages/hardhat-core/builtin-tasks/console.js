"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path = __importStar(require("path"));
const semver = __importStar(require("semver"));
const config_env_1 = require("../internal/core/config/config-env");
const scripts_runner_1 = require("../internal/util/scripts-runner");
const task_names_1 = require("./task-names");
const log = debug_1.default("hardhat:core:tasks:console");
config_env_1.task(task_names_1.TASK_CONSOLE, "Opens a hardhat console")
    .addFlag("noCompile", "Don't compile before running this task")
    .setAction(async ({ noCompile }, { config, run, hardhatArguments }) => {
    if (!noCompile) {
        await run(task_names_1.TASK_COMPILE, { quiet: true });
    }
    await fs_extra_1.default.ensureDir(config.paths.cache);
    const historyFile = path.join(config.paths.cache, "console-history.txt");
    const nodeArgs = [];
    if (semver.gte(process.version, "10.0.0")) {
        nodeArgs.push("--experimental-repl-await");
    }
    log(`Creating a Node REPL subprocess with Hardhat's register so we can set some Node's flags`);
    // Running the script "" is like running `node`, so this starts the repl
    await scripts_runner_1.runScriptWithHardhat(hardhatArguments, "", [], nodeArgs, {
        NODE_REPL_HISTORY: historyFile,
    });
});
//# sourceMappingURL=console.js.map