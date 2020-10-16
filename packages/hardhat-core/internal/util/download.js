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
const fs_1 = __importDefault(require("fs"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const util_1 = __importDefault(require("util"));
async function download(url, filePath, timeoutMillis = 10000) {
    const { pipeline } = await Promise.resolve().then(() => __importStar(require("stream")));
    const { default: fetch } = await Promise.resolve().then(() => __importStar(require("node-fetch")));
    const streamPipeline = util_1.default.promisify(pipeline);
    const response = await fetch(url, { timeout: timeoutMillis });
    if (response.ok && response.body !== null) {
        await fs_extra_1.default.ensureDir(path_1.default.dirname(filePath));
        return streamPipeline(response.body, fs_1.default.createWriteStream(filePath));
    }
    // Consume the response stream and discard its result
    // See: https://github.com/node-fetch/node-fetch/issues/83
    const _discarded = await response.arrayBuffer();
    // tslint:disable-next-line only-hardhat-error
    throw new Error(`Failed to download ${url} - ${response.statusText} received`);
}
exports.download = download;
//# sourceMappingURL=download.js.map