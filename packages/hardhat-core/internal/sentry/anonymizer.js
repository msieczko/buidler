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
const find_up_1 = __importDefault(require("find-up"));
const fp_ts_1 = require("fp-ts");
const path = __importStar(require("path"));
const ANONYMIZED_FILE = "<user-file>";
class Anonymizer {
    constructor(_configPath) {
        this._configPath = _configPath;
    }
    /**
     * Given a sentry serialized exception
     * (https://develop.sentry.dev/sdk/event-payloads/exception/), return an
     * anonymized version of the event.
     */
    anonymize(event) {
        if (event === null || event === undefined) {
            return fp_ts_1.either.left("event is null or undefined");
        }
        if (typeof event !== "object") {
            return fp_ts_1.either.left("event is not an object");
        }
        const result = {
            event_id: event.event_id,
            platform: event.platform,
            timestamp: event.timestamp,
            extra: event.extra,
        };
        if (event.exception !== undefined && event.exception.values !== undefined) {
            const anonymizededExceptions = this._anonymizeExceptions(event.exception.values);
            result.exception = {
                values: anonymizededExceptions,
            };
        }
        return fp_ts_1.either.right(result);
    }
    /**
     * Return the anonymized filename and a boolean indicating if the content of
     * the file should be anonymized
     */
    anonymizeFilename(filename) {
        if (filename === this._configPath) {
            const packageJsonPath = this._getFilePackageJsonPath(filename);
            if (packageJsonPath === null) {
                // if we can't find a package.json, we just return the basename
                return {
                    anonymizedFilename: path.basename(filename),
                    anonymizeContent: true,
                };
            }
            return {
                anonymizedFilename: path.relative(path.dirname(packageJsonPath), filename),
                anonymizeContent: true,
            };
        }
        const parts = filename.split(path.sep);
        const nodeModulesIndex = parts.indexOf("node_modules");
        if (nodeModulesIndex === -1) {
            if (filename.startsWith("internal")) {
                // show internal parts of the stack trace
                return {
                    anonymizedFilename: filename,
                    anonymizeContent: false,
                };
            }
            // if the file isn't inside node_modules and it's a user file, we hide it completely
            return {
                anonymizedFilename: ANONYMIZED_FILE,
                anonymizeContent: true,
            };
        }
        return {
            anonymizedFilename: parts.slice(nodeModulesIndex).join(path.sep),
            anonymizeContent: false,
        };
    }
    anonymizeErrorMessage(errorMessage) {
        // the \\ before path.sep is necessary for this to work on windows
        const pathRegex = new RegExp(`\\S+\\${path.sep}\\S+`, "g");
        // for files that don't have a path separator
        const fileRegex = new RegExp("\\S+\\.(js|ts)\\S*", "g");
        // hide hex strings of 20 chars or more
        const hexRegex = /(0x)?[0-9A-Fa-f]{20,}/g;
        return errorMessage
            .replace(pathRegex, ANONYMIZED_FILE)
            .replace(fileRegex, ANONYMIZED_FILE)
            .replace(hexRegex, (match) => match.replace(/./g, "x"));
    }
    raisedByHardhat(event) {
        var _a, _b;
        const exceptions = (_a = event === null || event === void 0 ? void 0 : event.exception) === null || _a === void 0 ? void 0 : _a.values;
        if (exceptions === undefined) {
            // if we can't prove that the exception doesn't come from hardhat,
            // we err on the side of reporting the error
            return true;
        }
        const originalException = exceptions[exceptions.length - 1];
        const frames = (_b = originalException === null || originalException === void 0 ? void 0 : originalException.stacktrace) === null || _b === void 0 ? void 0 : _b.frames;
        if (frames === undefined) {
            return true;
        }
        for (const frame of frames.slice().reverse()) {
            if (frame.filename === undefined) {
                continue;
            }
            // we stop after finding either a hardhat file or a file from the user's
            // project
            if (this._isHardhatFile(frame.filename)) {
                return true;
            }
            if (frame.filename === ANONYMIZED_FILE) {
                return false;
            }
            if (this._configPath !== undefined &&
                this._configPath.includes(frame.filename)) {
                return false;
            }
        }
        // if we didn't find any hardhat frame, we don't report the error
        return false;
    }
    _getFilePackageJsonPath(filename) {
        return find_up_1.default.sync("package.json", {
            cwd: path.dirname(filename),
        });
    }
    _isHardhatFile(filename) {
        const nomiclabsPath = path.join("node_modules", "@nomiclabs");
        const truffleContractPath = path.join(nomiclabsPath, "truffle-contract");
        const isHardhatFile = filename.startsWith(nomiclabsPath) &&
            !filename.startsWith(truffleContractPath);
        return isHardhatFile;
    }
    _anonymizeExceptions(exceptions) {
        return exceptions.map((exception) => this._anonymizeException(exception));
    }
    _anonymizeException(value) {
        const result = {
            type: value.type,
        };
        if (value.value !== undefined) {
            result.value = this.anonymizeErrorMessage(value.value);
        }
        if (value.stacktrace !== undefined) {
            result.stacktrace = this._anonymizeStacktrace(value.stacktrace);
        }
        return result;
    }
    _anonymizeStacktrace(stacktrace) {
        if (stacktrace.frames !== undefined) {
            const anonymizededFrames = this._anonymizeFrames(stacktrace.frames);
            return {
                frames: anonymizededFrames,
            };
        }
        return {};
    }
    _anonymizeFrames(frames) {
        return frames.map((frame) => this._anonymizeFrame(frame));
    }
    _anonymizeFrame(frame) {
        const result = {
            lineno: frame.lineno,
            colno: frame.colno,
            function: frame.function,
        };
        let anonymizeContent = true;
        if (frame.filename !== undefined) {
            const anonymizationResult = this.anonymizeFilename(frame.filename);
            result.filename = anonymizationResult.anonymizedFilename;
            anonymizeContent = anonymizationResult.anonymizeContent;
        }
        if (!anonymizeContent) {
            result.context_line = frame.context_line;
            result.pre_context = frame.pre_context;
            result.post_context = frame.post_context;
            result.vars = frame.vars;
        }
        return result;
    }
}
exports.Anonymizer = Anonymizer;
//# sourceMappingURL=anonymizer.js.map