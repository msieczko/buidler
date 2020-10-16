"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const log = debug_1.default("hardhat:core:solidity:imports");
class Parser {
    constructor(_solidityFilesCache) {
        this._solidityFilesCache = _solidityFilesCache;
        this._cache = new Map();
    }
    parse(fileContent, absolutePath) {
        const cacheResult = this._getFromCache(absolutePath);
        if (cacheResult !== null) {
            return cacheResult;
        }
        let result;
        try {
            const parser = require("@solidity-parser/parser");
            const ast = parser.parse(fileContent, { tolerant: true });
            const imports = [];
            const versionPragmas = [];
            parser.visit(ast, {
                ImportDirective: (node) => imports.push(node.path),
                PragmaDirective: (node) => {
                    if (node.name === "solidity") {
                        versionPragmas.push(node.value);
                    }
                },
            });
            result = { imports, versionPragmas };
        }
        catch (error) {
            log("Failed to parse Solidity file to extract its imports, using regex fallback\n", error);
            result = {
                imports: findImportsWithRegexps(fileContent),
                versionPragmas: findVersionPragmasWithRegexps(fileContent),
            };
        }
        this._cache.set(absolutePath, result);
        return result;
    }
    _getFromCache(absolutePath) {
        var _a, _b;
        const cacheEntry = (_a = this._solidityFilesCache) === null || _a === void 0 ? void 0 : _a.getEntry(absolutePath);
        if (cacheEntry !== undefined) {
            const { imports, versionPragmas } = cacheEntry;
            return { imports, versionPragmas };
        }
        return (_b = this._cache.get(absolutePath)) !== null && _b !== void 0 ? _b : null;
    }
}
exports.Parser = Parser;
function findImportsWithRegexps(fileContent) {
    const importsRegexp = /import\s+(?:(?:"([^;]*)"|'([^;]*)')(?:;|\s+as\s+[^;]*;)|.+from\s+(?:"(.*)"|'(.*)');)/g;
    let imports = [];
    let result;
    while (true) {
        result = importsRegexp.exec(fileContent);
        if (result === null) {
            return imports;
        }
        imports = [
            ...imports,
            ...result.slice(1).filter((m) => m !== undefined),
        ];
    }
}
function findVersionPragmasWithRegexps(fileContent) {
    const versionPragmasRegexp = /pragma\s+solidity\s+(.+?);/g;
    let versionPragmas = [];
    let result;
    while (true) {
        result = versionPragmasRegexp.exec(fileContent);
        if (result === null) {
            return versionPragmas;
        }
        versionPragmas = [
            ...versionPragmas,
            ...result.slice(1).filter((m) => m !== undefined),
        ];
    }
}
//# sourceMappingURL=parse.js.map