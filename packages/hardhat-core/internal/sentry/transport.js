"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
// This class is wrapped in a function to avoid having to
// import @sentry/node just for the BaseTransport base class
function getSubprocessTransport() {
    const { Status, Transports } = require("@sentry/node");
    class SubprocessTransport extends Transports.BaseTransport {
        async sendEvent(event) {
            var _a, _b, _c;
            const extra = (_a = event.extra) !== null && _a !== void 0 ? _a : {};
            const { verbose = false, configPath } = extra;
            // don't send user's full config path for privacy reasons
            (_b = event.extra) === null || _b === void 0 ? true : delete _b.configPath;
            // we don't care about the verbose setting
            (_c = event.extra) === null || _c === void 0 ? true : delete _c.verbose;
            const serializedEvent = JSON.stringify(event);
            const env = {
                HARDHAT_SENTRY_EVENT: serializedEvent,
                HARDHAT_SENTRY_VERBOSE: verbose.toString(),
            };
            if (configPath !== undefined) {
                env.HARDHAT_SENTRY_CONFIG_PATH = configPath;
            }
            const subprocessPath = path.join(__dirname, "subprocess");
            const subprocess = child_process_1.spawn(process.execPath, [subprocessPath], {
                detached: true,
                env,
                stdio: (verbose ? "inherit" : "ignore"),
            });
            subprocess.unref();
            return {
                status: Status.Success,
            };
        }
    }
    return SubprocessTransport;
}
exports.getSubprocessTransport = getSubprocessTransport;
//# sourceMappingURL=transport.js.map