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
const fs = __importStar(require("fs"));
class Compiler {
    constructor(_pathToSolcJs) {
        this._pathToSolcJs = _pathToSolcJs;
    }
    async compile(input) {
        const solc = await this.getSolc();
        const jsonOutput = solc.compile(JSON.stringify(input));
        return JSON.parse(jsonOutput);
    }
    async getSolc() {
        if (this._loadedSolc !== undefined) {
            return this._loadedSolc;
        }
        const { default: solcWrapper } = await Promise.resolve().then(() => __importStar(require("solc/wrapper")));
        this._loadedSolc = solcWrapper(this._loadCompilerSources(this._pathToSolcJs));
        return this._loadedSolc;
    }
    /**
     * This function loads the compiler sources bypassing any require hook.
     *
     * The compiler is a huge asm.js file, and using a simple require may trigger
     * babel/register and hang the process.
     */
    _loadCompilerSources(compilerPath) {
        const Module = module.constructor;
        const previousHook = Module._extensions[".js"];
        Module._extensions[".js"] = function (module, filename) {
            const content = fs.readFileSync(filename, "utf8");
            Object.getPrototypeOf(module)._compile.call(module, content, filename);
        };
        const loadedSolc = require(compilerPath);
        Module._extensions[".js"] = previousHook;
        return loadedSolc;
    }
}
exports.Compiler = Compiler;
class NativeCompiler {
    constructor(_pathToSolc) {
        this._pathToSolc = _pathToSolc;
    }
    async compile(input) {
        const output = await new Promise((resolve, reject) => {
            const process = child_process_1.exec(`${this._pathToSolc} --standard-json`, {
                maxBuffer: 1024 * 1024 * 500,
            }, (err, stdout) => {
                if (err !== null) {
                    return reject(err);
                }
                resolve(stdout);
            });
            process.stdin.write(JSON.stringify(input));
            process.stdin.end();
        });
        return JSON.parse(output);
    }
}
exports.NativeCompiler = NativeCompiler;
//# sourceMappingURL=index.js.map