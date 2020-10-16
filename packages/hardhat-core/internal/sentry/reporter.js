"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../core/errors");
const execution_mode_1 = require("../core/execution-mode");
const errors_2 = require("../core/providers/errors");
const ci_detection_1 = require("../util/ci-detection");
const global_dir_1 = require("../util/global-dir");
const packageInfo_1 = require("../util/packageInfo");
const transport_1 = require("./transport");
exports.SENTRY_DSN = "https://38ba58bb85fa409e9bb7f50d2c419bc2@o385026.ingest.sentry.io/5224869";
/**
 * This class acts as a global singleton for reporting errors through Sentry.
 */
class Reporter {
    constructor() {
        this.initialized = false;
        this.verbose = false;
        this.enabled = true;
        if (ci_detection_1.isRunningOnCiServer()) {
            this.enabled = false;
        }
        // set HARDHAT_ENABLE_SENTRY=true to enable sentry during development (for local testing)
        if (execution_mode_1.isLocalDev() && process.env.HARDHAT_ENABLE_SENTRY === undefined) {
            this.enabled = false;
        }
    }
    static reportError(error) {
        const instance = Reporter._getInstance();
        if (!instance.enabled) {
            return;
        }
        if (!Reporter.shouldReport(error)) {
            return;
        }
        instance.init();
        const Sentry = require("@sentry/node");
        Sentry.setExtra("verbose", instance.verbose);
        Sentry.setExtra("configPath", instance.configPath);
        Sentry.setExtra("nodeVersion", process.version);
        const hardhatVersion = packageInfo_1.getHardhatVersion();
        Sentry.setExtra("hardhatVersion", hardhatVersion);
        Sentry.captureException(error);
        return true;
    }
    /**
     * Enable or disable reporting. When disabled, all calls to `reportError` are
     * no-ops.
     */
    static setEnabled(enabled) {
        const instance = Reporter._getInstance();
        instance.enabled = enabled;
    }
    /**
     * Enable or disable verbose output. This is necessary to pass the correct
     * environment variable to the transport subprocess.
     */
    static setVerbose(verbose) {
        const instance = Reporter._getInstance();
        instance.verbose = verbose;
    }
    /**
     * The path to the hardhat config file. We use this when files are anonymized,
     * since the hardhat config is the only file in the user's project that is not
     * anonymized.
     */
    static setConfigPath(configPath) {
        const instance = Reporter._getInstance();
        instance.configPath = configPath;
    }
    /**
     * Wait until all Sentry events were sent or until `timeout` milliseconds are
     * elapsed.
     *
     * This needs to be used before calling `process.exit`, otherwise some events
     * might get lost.
     */
    static async close(timeout) {
        const instance = Reporter._getInstance();
        if (!instance.enabled || !instance.initialized) {
            return true;
        }
        const Sentry = await Promise.resolve().then(() => __importStar(require("@sentry/node")));
        return Sentry.close(timeout);
    }
    static shouldReport(error) {
        if (errors_1.HardhatError.isHardhatError(error) &&
            !error.errorDescriptor.shouldBeReported) {
            return false;
        }
        if (errors_1.HardhatPluginError.isHardhatPluginError(error)) {
            if (errors_1.NomicLabsHardhatPluginError.isNomicLabsHardhatPluginError(error)) {
                return error.shouldBeReported;
            }
            // don't log errors from third-party plugins
            return false;
        }
        // We don't report network related errors
        if (error instanceof errors_2.ProviderError) {
            return false;
        }
        if (!Reporter._hasTelemetryConsent()) {
            return false;
        }
        return true;
    }
    static _getInstance() {
        if (this._instance === undefined) {
            this._instance = new Reporter();
        }
        return this._instance;
    }
    static _hasTelemetryConsent() {
        const telemetryConsent = global_dir_1.hasConsentedTelemetry();
        return telemetryConsent === true;
    }
    init() {
        if (this.initialized) {
            return;
        }
        const Sentry = require("@sentry/node");
        const linkedErrorsIntegration = new Sentry.Integrations.LinkedErrors({
            key: "parent",
        });
        Sentry.init({
            dsn: exports.SENTRY_DSN,
            transport: transport_1.getSubprocessTransport(),
            integrations: () => [linkedErrorsIntegration],
        });
        this.initialized = true;
    }
}
exports.Reporter = Reporter;
//# sourceMappingURL=reporter.js.map