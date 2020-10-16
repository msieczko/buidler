"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const resolve_1 = __importDefault(require("resolve"));
const source_names_1 = require("../../utils/source-names");
const errors_1 = require("../core/errors");
const errors_list_1 = require("../core/errors-list");
const NODE_MODULES = "node_modules";
class ResolvedFile {
    constructor(sourceName, absolutePath, content, lastModificationDate, libraryName, libraryVersion) {
        this.sourceName = sourceName;
        this.absolutePath = absolutePath;
        this.content = content;
        this.lastModificationDate = lastModificationDate;
        if (libraryName !== undefined && libraryVersion !== undefined) {
            this.library = {
                name: libraryName,
                version: libraryVersion,
            };
        }
    }
    getVersionedName() {
        return (this.sourceName +
            (this.library !== undefined ? `@v${this.library.version}` : ""));
    }
}
exports.ResolvedFile = ResolvedFile;
class Resolver {
    constructor(_projectRoot, _parser) {
        this._projectRoot = _projectRoot;
        this._parser = _parser;
    }
    /**
     * Resolves a source name into a ResolvedFile.
     *
     * @param sourceName The source name as it would be provided to solc.
     */
    async resolveSourceName(sourceName) {
        source_names_1.validateSourceNameFormat(sourceName);
        if (await source_names_1.isLocalSourceName(this._projectRoot, sourceName)) {
            return this._resolveLocalSourceName(sourceName);
        }
        return this._resolveLibrarySourceName(sourceName);
    }
    /**
     * Resolves an import from an already resolved file.
     * @param from The file were the import statement is present.
     * @param imported The path in the import statement.
     */
    async resolveImport(from, imported) {
        const scheme = this._getUriScheme(imported);
        if (scheme !== undefined) {
            throw new errors_1.HardhatError(errors_list_1.ERRORS.RESOLVER.INVALID_IMPORT_PROTOCOL, {
                from: from.sourceName,
                imported,
                protocol: scheme,
            });
        }
        if (source_names_1.replaceBackslashes(imported) !== imported) {
            throw new errors_1.HardhatError(errors_list_1.ERRORS.RESOLVER.INVALID_IMPORT_BACKSLASH, {
                from: from.sourceName,
                imported,
            });
        }
        if (source_names_1.isAbsolutePathSourceName(imported)) {
            throw new errors_1.HardhatError(errors_list_1.ERRORS.RESOLVER.INVALID_IMPORT_ABSOLUTE_PATH, {
                from: from.sourceName,
                imported,
            });
        }
        try {
            if (!this._isRelativeImport(imported)) {
                return await this.resolveSourceName(source_names_1.normalizeSourceName(imported));
            }
            const sourceName = await this._relativeImportToSourceName(from, imported);
            // We have this special case here, because otherwise local relative
            // imports can be treated as library imports. For example if
            // `contracts/c.sol` imports `../non-existent/a.sol`
            if (from.library === undefined &&
                !this._isRelativeImportToLibrary(from, imported)) {
                return await this._resolveLocalSourceName(sourceName);
            }
            return await this.resolveSourceName(sourceName);
        }
        catch (error) {
            if (errors_1.HardhatError.isHardhatErrorType(error, errors_list_1.ERRORS.RESOLVER.FILE_NOT_FOUND) ||
                errors_1.HardhatError.isHardhatErrorType(error, errors_list_1.ERRORS.RESOLVER.LIBRARY_FILE_NOT_FOUND)) {
                throw new errors_1.HardhatError(errors_list_1.ERRORS.RESOLVER.IMPORTED_FILE_NOT_FOUND, {
                    imported,
                    from: from.sourceName,
                }, error);
            }
            if (errors_1.HardhatError.isHardhatErrorType(error, errors_list_1.ERRORS.RESOLVER.WRONG_SOURCE_NAME_CASING)) {
                throw new errors_1.HardhatError(errors_list_1.ERRORS.RESOLVER.INVALID_IMPORT_WRONG_CASING, {
                    imported,
                    from: from.sourceName,
                }, error);
            }
            if (errors_1.HardhatError.isHardhatErrorType(error, errors_list_1.ERRORS.RESOLVER.LIBRARY_NOT_INSTALLED)) {
                throw new errors_1.HardhatError(errors_list_1.ERRORS.RESOLVER.IMPORTED_LIBRARY_NOT_INSTALLED, {
                    library: error.messageArguments.library,
                    from: from.sourceName,
                }, error);
            }
            // tslint:disable-next-line only-hardhat-error
            throw error;
        }
    }
    async _resolveLocalSourceName(sourceName) {
        await this._validateSourceNameExistenceAndCasing(this._projectRoot, sourceName, false);
        const absolutePath = path_1.default.join(this._projectRoot, sourceName);
        return this._resolveFile(sourceName, absolutePath);
    }
    async _resolveLibrarySourceName(sourceName) {
        const libraryName = this._getLibraryName(sourceName);
        let packageJsonPath;
        try {
            packageJsonPath = this._resolveNodeModulesFileFromProjectRoot(path_1.default.join(libraryName, "package.json"));
        }
        catch (error) {
            // if the project is using a dependency from hardhat itself but it can't
            // be found, this means that a global installation is being used, so we
            // resolve the dependency relative to this file
            if (libraryName === "hardhat") {
                const hardhatCoreDir = path_1.default.join(__dirname, "..", "..");
                packageJsonPath = path_1.default.join(hardhatCoreDir, "package.json");
            }
            else {
                throw new errors_1.HardhatError(errors_list_1.ERRORS.RESOLVER.LIBRARY_NOT_INSTALLED, {
                    library: libraryName,
                }, error);
            }
        }
        let nodeModulesPath = path_1.default.dirname(path_1.default.dirname(packageJsonPath));
        if (this._isScopedPackage(sourceName)) {
            nodeModulesPath = path_1.default.dirname(nodeModulesPath);
        }
        await this._validateSourceNameExistenceAndCasing(nodeModulesPath, sourceName, true);
        const packageInfo = await fs_extra_1.default.readJson(packageJsonPath);
        const libraryVersion = packageInfo.version;
        return this._resolveFile(sourceName, 
        // We resolve to the real path here, as we may be resolving a linked library
        await fs_extra_1.default.realpath(path_1.default.join(nodeModulesPath, sourceName)), libraryName, libraryVersion);
    }
    async _relativeImportToSourceName(from, imported) {
        // This is a special case, were we turn relative imports from local files
        // into library imports if necessary. The reason for this is that many
        // users just do `import "../node_modules/lib/a.sol";`.
        if (this._isRelativeImportToLibrary(from, imported)) {
            return this._relativeImportToLibraryToSourceName(from, imported);
        }
        const sourceName = source_names_1.normalizeSourceName(path_1.default.join(path_1.default.dirname(from.sourceName), imported));
        // If the file with the import is local, and the normalized version
        // starts with ../ means that it's trying to get outside of the project.
        if (from.library === undefined && sourceName.startsWith("../")) {
            throw new errors_1.HardhatError(errors_list_1.ERRORS.RESOLVER.INVALID_IMPORT_OUTSIDE_OF_PROJECT, { from: from.sourceName, imported });
        }
        if (from.library !== undefined &&
            !this._isInsideSameDir(from.sourceName, sourceName)) {
            // If the file is being imported from a library, this means that it's
            // trying to reach another one.
            throw new errors_1.HardhatError(errors_list_1.ERRORS.RESOLVER.ILLEGAL_IMPORT, {
                from: from.sourceName,
                imported,
            });
        }
        return sourceName;
    }
    async _resolveFile(sourceName, absolutePath, libraryName, libraryVersion) {
        const rawContent = await fs_extra_1.default.readFile(absolutePath, {
            encoding: "utf8",
        });
        const stats = await fs_extra_1.default.stat(absolutePath);
        const lastModificationDate = new Date(stats.ctime);
        const parsedContent = this._parser.parse(rawContent, absolutePath);
        const content = Object.assign({ rawContent }, parsedContent);
        return new ResolvedFile(sourceName, absolutePath, content, lastModificationDate, libraryName, libraryVersion);
    }
    _isRelativeImport(imported) {
        return imported.startsWith("./") || imported.startsWith("../");
    }
    _resolveNodeModulesFileFromProjectRoot(fileName) {
        return resolve_1.default.sync(fileName, {
            basedir: this._projectRoot,
            preserveSymlinks: true,
        });
    }
    _getLibraryName(sourceName) {
        const endIndex = this._isScopedPackage(sourceName)
            ? sourceName.indexOf("/", sourceName.indexOf("/") + 1)
            : sourceName.indexOf("/");
        return sourceName.slice(0, endIndex);
    }
    _getUriScheme(s) {
        const re = /([a-zA-Z]+):\/\//;
        const match = re.exec(s);
        if (match === null) {
            return undefined;
        }
        return match[1];
    }
    _isInsideSameDir(sourceNameInDir, sourceNameToTest) {
        const firstSlash = sourceNameInDir.indexOf("/");
        const dir = firstSlash !== -1
            ? sourceNameInDir.substring(0, firstSlash)
            : sourceNameInDir;
        return sourceNameToTest.startsWith(dir);
    }
    _isScopedPackage(packageOrPackageFile) {
        return packageOrPackageFile.startsWith("@");
    }
    _isRelativeImportToLibrary(from, imported) {
        return (this._isRelativeImport(imported) &&
            from.library === undefined &&
            imported.includes(`${NODE_MODULES}/`));
    }
    _relativeImportToLibraryToSourceName(from, imported) {
        const sourceName = source_names_1.normalizeSourceName(path_1.default.join(path_1.default.dirname(from.sourceName), imported));
        const nmIndex = sourceName.indexOf(`${NODE_MODULES}/`);
        return sourceName.substr(nmIndex + NODE_MODULES.length + 1);
    }
    async _validateSourceNameExistenceAndCasing(fromDir, sourceName, isLibrary) {
        try {
            await source_names_1.validateSourceNameExistenceAndCasing(fromDir, sourceName);
        }
        catch (error) {
            if (errors_1.HardhatError.isHardhatErrorType(error, errors_list_1.ERRORS.SOURCE_NAMES.FILE_NOT_FOUND)) {
                throw new errors_1.HardhatError(isLibrary
                    ? errors_list_1.ERRORS.RESOLVER.LIBRARY_FILE_NOT_FOUND
                    : errors_list_1.ERRORS.RESOLVER.FILE_NOT_FOUND, { file: sourceName }, error);
            }
            if (errors_1.HardhatError.isHardhatErrorType(error, errors_list_1.ERRORS.SOURCE_NAMES.WRONG_CASING)) {
                throw new errors_1.HardhatError(errors_list_1.ERRORS.RESOLVER.WRONG_SOURCE_NAME_CASING, {
                    incorrect: sourceName,
                    correct: error.messageArguments.correct,
                }, error);
            }
            // tslint:disable-next-line only-hardhat-error
            throw error;
        }
    }
}
exports.Resolver = Resolver;
//# sourceMappingURL=resolver.js.map