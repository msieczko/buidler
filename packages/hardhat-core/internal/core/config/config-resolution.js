"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const cloneDeep_1 = __importDefault(require("lodash/cloneDeep"));
const path_1 = __importDefault(require("path"));
const constants_1 = require("../../constants");
const lang_1 = require("../../util/lang");
const errors_1 = require("../errors");
const util_1 = require("../providers/util");
const default_config_1 = require("./default-config");
/**
 * This functions resolves the hardhat config, setting its defaults and
 * normalizing its types if necessary.
 *
 * @param userConfigPath the user config filepath
 * @param userConfig     the user config object
 *
 * @returns the resolved config
 */
function resolveConfig(userConfigPath, userConfig) {
    var _a;
    userConfig = cloneDeep_1.default(userConfig);
    return Object.assign(Object.assign({}, userConfig), { defaultNetwork: (_a = userConfig.defaultNetwork) !== null && _a !== void 0 ? _a : default_config_1.defaultDefaultNetwork, paths: resolveProjectPaths(userConfigPath, userConfig.paths), networks: resolveNetworksConfig(userConfig.networks), solidity: resolveSolidityConfig(userConfig), mocha: resolveMochaConfig(userConfig) });
}
exports.resolveConfig = resolveConfig;
function resolveNetworksConfig(networksConfig = {}) {
    var _a;
    const hardhatNetworkConfig = networksConfig[constants_1.HARDHAT_NETWORK_NAME];
    const localhostNetworkConfig = (_a = networksConfig.localhost) !== null && _a !== void 0 ? _a : undefined;
    const hardhat = resolveHardhatNetworkConfig(hardhatNetworkConfig);
    const localhost = resolveHttpNetworkConfig(Object.assign(Object.assign({}, cloneDeep_1.default(default_config_1.defaultLocalhostNetworkParams)), localhostNetworkConfig));
    const otherNetworks = lang_1.fromEntries(Object.entries(networksConfig)
        .filter(([name, config]) => name !== "localhost" &&
        name !== "hardhat" &&
        config !== undefined &&
        isHttpNetworkConfig(config))
        .map(([name, config]) => [
        name,
        resolveHttpNetworkConfig(config),
    ]));
    return Object.assign({ hardhat,
        localhost }, otherNetworks);
}
function isHttpNetworkConfig(config) {
    return "url" in config;
}
function normalizeHexString(str) {
    const normalized = str.trim().toLowerCase();
    if (normalized.startsWith("0x")) {
        return normalized;
    }
    return `0x${normalized}`;
}
function resolveHardhatNetworkConfig(hardhatNetworkConfig = {}) {
    var _a, _b, _c, _d;
    const clonedDefaultHardhatNetworkParams = cloneDeep_1.default(default_config_1.defaultHardhatNetworkParams);
    const accounts = hardhatNetworkConfig.accounts === undefined
        ? clonedDefaultHardhatNetworkParams.accounts
        : Array.isArray(hardhatNetworkConfig.accounts)
            ? hardhatNetworkConfig.accounts.map(({ privateKey, balance }) => ({
                privateKey: normalizeHexString(privateKey),
                balance,
            }))
            : util_1.normalizeHardhatNetworkAccountsConfig(Object.assign(Object.assign(Object.assign({}, default_config_1.defaultHardhatNetworkHdAccountsConfigParams), hardhatNetworkConfig.accounts), { mnemonic: (_a = hardhatNetworkConfig.accounts.mnemonic) !== null && _a !== void 0 ? _a : default_config_1.defaultHardhatNetworkHdAccountsConfigParams.menmonic }));
    const forking = hardhatNetworkConfig.forking !== undefined
        ? {
            url: hardhatNetworkConfig.forking.url,
            enabled: (_b = hardhatNetworkConfig.forking.enabled) !== null && _b !== void 0 ? _b : true,
        }
        : undefined;
    const blockNumber = (_c = hardhatNetworkConfig === null || hardhatNetworkConfig === void 0 ? void 0 : hardhatNetworkConfig.forking) === null || _c === void 0 ? void 0 : _c.blockNumber;
    if (blockNumber !== undefined && forking !== undefined) {
        forking.blockNumber = (_d = hardhatNetworkConfig === null || hardhatNetworkConfig === void 0 ? void 0 : hardhatNetworkConfig.forking) === null || _d === void 0 ? void 0 : _d.blockNumber;
    }
    const config = Object.assign(Object.assign(Object.assign({}, clonedDefaultHardhatNetworkParams), hardhatNetworkConfig), { accounts,
        forking });
    // We do it this way because ts gets lost otherwise
    if (config.forking === undefined) {
        delete config.forking;
    }
    return config;
}
function isHdAccountsConfig(accounts) {
    return typeof accounts === "object" && !Array.isArray(accounts);
}
function resolveHttpNetworkConfig(networkConfig) {
    const accounts = networkConfig.accounts === undefined
        ? default_config_1.defaultHttpNetworkParams.accounts
        : isHdAccountsConfig(networkConfig.accounts)
            ? Object.assign(Object.assign({}, default_config_1.defaultHdAccountsConfigParams), networkConfig.accounts) : Array.isArray(networkConfig.accounts)
            ? networkConfig.accounts.map(normalizeHexString)
            : "remote";
    const url = networkConfig.url;
    errors_1.assertHardhatInvariant(url !== undefined, "Invalid http network config provided. URL missing.");
    return Object.assign(Object.assign(Object.assign({}, cloneDeep_1.default(default_config_1.defaultHttpNetworkParams)), networkConfig), { accounts,
        url });
}
function resolveSolidityConfig(userConfig) {
    var _a, _b;
    const userSolidityConfig = (_a = userConfig.solidity) !== null && _a !== void 0 ? _a : default_config_1.DEFAULT_SOLC_VERSION;
    const multiSolcConfig = normalizeSolidityConfig(userSolidityConfig);
    const overrides = (_b = multiSolcConfig.overrides) !== null && _b !== void 0 ? _b : {};
    return {
        compilers: multiSolcConfig.compilers.map(resolveCompiler),
        overrides: lang_1.fromEntries(Object.entries(overrides).map(([name, config]) => [
            name,
            resolveCompiler(config),
        ])),
    };
}
function normalizeSolidityConfig(solidityConfig) {
    if (typeof solidityConfig === "string") {
        return {
            compilers: [
                {
                    version: solidityConfig,
                },
            ],
        };
    }
    if ("version" in solidityConfig) {
        return { compilers: [solidityConfig] };
    }
    return solidityConfig;
}
function resolveCompiler(compiler) {
    var _a;
    const resolved = {
        version: compiler.version,
        settings: (_a = compiler.settings) !== null && _a !== void 0 ? _a : {},
    };
    resolved.settings.optimizer = Object.assign({ enabled: false, runs: 200 }, resolved.settings.optimizer);
    if (resolved.settings.outputSelection === undefined) {
        resolved.settings.outputSelection = {};
    }
    for (const [file, contractSelection] of Object.entries(default_config_1.defaultSolcOutputSelection)) {
        if (resolved.settings.outputSelection[file] === undefined) {
            resolved.settings.outputSelection[file] = {};
        }
        for (const [contract, outputs] of Object.entries(contractSelection)) {
            if (resolved.settings.outputSelection[file][contract] === undefined) {
                resolved.settings.outputSelection[file][contract] = [];
            }
            for (const output of outputs) {
                if (!resolved.settings.outputSelection[file][contract].includes(output)) {
                    resolved.settings.outputSelection[file][contract].push(output);
                }
            }
        }
    }
    return resolved;
}
function resolveMochaConfig(userConfig) {
    return Object.assign(Object.assign({}, cloneDeep_1.default(default_config_1.defaultMochaOptions)), userConfig.mocha);
}
/**
 * This function resolves the ProjectPaths object from the user-provided config
 * and its path. The logic of this is not obvious and should well be document.
 * The good thing is that most users will never use this.
 *
 * Explanation:
 *    - paths.configFile is not overridable
 *    - If a path is absolute it is used "as is".
 *    - If the root path is relative, it's resolved from paths.configFile's dir.
 *    - If any other path is relative, it's resolved from paths.root.
 *    - Plugin-defined paths are not resolved, but encouraged to follow the same pattern.
 */
function resolveProjectPaths(userConfigPath, userPaths = {}) {
    const configFile = fs.realpathSync(userConfigPath);
    const configDir = path_1.default.dirname(configFile);
    const root = resolvePathFrom(configDir, "", userPaths.root);
    return Object.assign(Object.assign({}, userPaths), { root,
        configFile, sources: resolvePathFrom(root, "contracts", userPaths.sources), cache: resolvePathFrom(root, "cache", userPaths.cache), artifacts: resolvePathFrom(root, "artifacts", userPaths.artifacts), tests: resolvePathFrom(root, "test", userPaths.tests) });
}
exports.resolveProjectPaths = resolveProjectPaths;
function resolvePathFrom(from, defaultPath, relativeOrAbsolutePath = defaultPath) {
    if (path_1.default.isAbsolute(relativeOrAbsolutePath)) {
        return relativeOrAbsolutePath;
    }
    return path_1.default.join(from, relativeOrAbsolutePath);
}
//# sourceMappingURL=config-resolution.js.map