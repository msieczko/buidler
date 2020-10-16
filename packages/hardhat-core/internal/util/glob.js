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
const path = __importStar(require("path"));
const util_1 = __importDefault(require("util"));
async function glob(pattern, options = {}) {
    const { default: globModule } = await Promise.resolve().then(() => __importStar(require("glob")));
    const files = await util_1.default.promisify(globModule)(pattern, options);
    return files.map(path.normalize);
}
exports.glob = glob;
function globSync(pattern, options = {}) {
    const files = require("glob").sync(pattern, options);
    return files.map(path.normalize);
}
exports.globSync = globSync;
//# sourceMappingURL=glob.js.map