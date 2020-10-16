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
const fs_extra_1 = __importDefault(require("fs-extra"));
const t = __importStar(require("io-ts"));
const path = __importStar(require("path"));
const constants_1 = require("../../internal/constants");
const FORMAT_VERSION = "hh-sol-cache-1";
const CacheEntryCodec = t.type({
    lastModificationDate: t.number,
    sourceName: t.string,
    solcConfig: t.any,
    imports: t.array(t.string),
    versionPragmas: t.array(t.string),
    artifacts: t.array(t.string),
});
const CacheCodec = t.type({
    _format: t.string,
    files: t.record(t.string, CacheEntryCodec),
});
class SolidityFilesCache {
    constructor(_cache) {
        this._cache = _cache;
    }
    static async readFromFile(solidityFilesCachePath) {
        let cacheRaw = {
            _format: FORMAT_VERSION,
            files: {},
        };
        if (fs_extra_1.default.existsSync(solidityFilesCachePath)) {
            cacheRaw = await fs_extra_1.default.readJson(solidityFilesCachePath);
        }
        const result = CacheCodec.decode(cacheRaw);
        if (result.isRight()) {
            const solidityFilesCache = new SolidityFilesCache(result.value);
            await solidityFilesCache.removeModifiedFiles();
            return solidityFilesCache;
        }
        // tslint:disable-next-line only-hardhat-error
        throw new Error("Couldn't read cache file, try running the clean task"); // TODO use HardhatError
    }
    async removeModifiedFiles() {
        for (const [absolutePath, cachedData] of Object.entries(this._cache.files)) {
            if (!fs_extra_1.default.existsSync(absolutePath)) {
                this.removeEntry(absolutePath);
                continue;
            }
            const stats = await fs_extra_1.default.stat(absolutePath);
            const lastModificationDate = new Date(stats.ctime);
            if (lastModificationDate.valueOf() !== cachedData.lastModificationDate) {
                this.removeEntry(absolutePath);
            }
        }
    }
    async writeToFile(solidityFilesCachePath) {
        await fs_extra_1.default.outputJson(solidityFilesCachePath, this._cache, {
            spaces: 2,
        });
    }
    addFile(absolutePath, entry) {
        this._cache.files[absolutePath] = entry;
    }
    getEntries() {
        return Object.values(this._cache.files);
    }
    getEntry(file) {
        return this._cache.files[file];
    }
    removeEntry(file) {
        delete this._cache.files[file];
    }
    hasFileChanged(absolutePath, lastModificationDate, solcConfig) {
        const { isEqual } = require("lodash");
        const cacheEntry = this.getEntry(absolutePath);
        if (cacheEntry === undefined) {
            // new file or no cache available, assume it's new
            return true;
        }
        if (cacheEntry.lastModificationDate < lastModificationDate.valueOf()) {
            return true;
        }
        if (solcConfig !== undefined &&
            !isEqual(solcConfig, cacheEntry.solcConfig)) {
            return true;
        }
        return false;
    }
}
exports.SolidityFilesCache = SolidityFilesCache;
function getSolidityFilesCachePath(paths) {
    return path.join(paths.cache, constants_1.SOLIDITY_FILES_CACHE_FILENAME);
}
exports.getSolidityFilesCachePath = getSolidityFilesCachePath;
//# sourceMappingURL=solidity-files-cache.js.map