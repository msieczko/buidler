"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const packageInfo_1 = require("../util/packageInfo");
/**
 * Returns true if Hardhat is installed locally or linked from its repository,
 * by looking for it using the node module resolution logic.
 *
 * If a config file is provided, we start looking for it from it. Otherwise,
 * we use the current working directory.
 */
function isHardhatInstalledLocallyOrLinked(configPath) {
    try {
        const resolvedPackageJson = require.resolve("hardhat/package.json", {
            paths: [configPath !== null && configPath !== void 0 ? configPath : process.cwd()],
        });
        const thisPackageJson = packageInfo_1.getPackageJsonPath();
        return resolvedPackageJson === thisPackageJson;
    }
    catch (_) {
        return false;
    }
}
exports.isHardhatInstalledLocallyOrLinked = isHardhatInstalledLocallyOrLinked;
/**
 * Checks whether we're using Hardhat in development mode (that is, we're working _on_ Hardhat).
 */
function isLocalDev() {
    // TODO: This may give a false positive under yarn PnP
    return isRunningHardhatCoreTests() || !__filename.includes("node_modules");
}
exports.isLocalDev = isLocalDev;
function isRunningHardhatCoreTests() {
    return __filename.endsWith(".ts");
}
exports.isRunningHardhatCoreTests = isRunningHardhatCoreTests;
//# sourceMappingURL=execution-mode.js.map