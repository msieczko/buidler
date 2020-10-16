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
const chalk_1 = __importDefault(require("chalk"));
const debug_1 = __importDefault(require("debug"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path = __importStar(require("path"));
const constants_1 = require("../../internal/constants");
const reporter_1 = require("../../internal/sentry/reporter");
const log = debug_1.default("hardhat:core:compilation-watcher");
async function watchCompilerOutput(provider, paths) {
    const chokidar = await Promise.resolve().then(() => __importStar(require("chokidar")));
    const buildInfoDir = path.join(paths.artifacts, constants_1.BUILD_INFO_DIR_NAME);
    const addCompilationResult = async (buildInfo) => {
        try {
            log("Adding new compilation result to the node");
            const { input, output, solcVersion } = await fs_extra_1.default.readJSON(buildInfo, {
                encoding: "utf8",
            });
            await provider.request({
                method: "hardhat_addCompilationResult",
                params: [solcVersion, input, output],
            });
        }
        catch (error) {
            console.warn(chalk_1.default.yellow("There was a problem adding the new compiler result. Run Hardhat with --verbose to learn more."));
            log("Last compilation result couldn't be added. Please report this to help us improve Hardhat.\n", error);
            reporter_1.Reporter.reportError(error);
        }
    };
    log(`Watching changes on '${buildInfoDir}'`);
    chokidar
        .watch(buildInfoDir, {
        ignoreInitial: true,
        awaitWriteFinish: {
            stabilityThreshold: 250,
            pollInterval: 50,
        },
    })
        .on("add", addCompilationResult);
}
exports.watchCompilerOutput = watchCompilerOutput;
//# sourceMappingURL=watch.js.map