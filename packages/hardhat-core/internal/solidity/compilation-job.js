"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const semver_1 = __importDefault(require("semver"));
const builtin_tasks_1 = require("../../types/builtin-tasks");
const errors_1 = require("../core/errors");
const log = debug_1.default("hardhat:core:compilation-job");
// this should have a proper version range when it's fixed
const SOLC_BUG_9573_VERSIONS = "*";
function isCompilationJobCreationError(x) {
    return typeof x === "string";
}
class CompilationJob {
    constructor(solidityConfig) {
        this.solidityConfig = solidityConfig;
        this._filesToCompile = new Map();
    }
    addFileToCompile(file, emitsArtifacts) {
        const fileToCompile = this._filesToCompile.get(file.sourceName);
        // if the file doesn't exist, we add it
        // we also add it if emitsArtifacts is true, to override it in case it was
        // previously added but with a false emitsArtifacts
        if (fileToCompile === undefined || emitsArtifacts) {
            this._filesToCompile.set(file.sourceName, { file, emitsArtifacts });
        }
    }
    hasSolc9573Bug() {
        var _a, _b, _c;
        return (((_c = (_b = (_a = this.solidityConfig) === null || _a === void 0 ? void 0 : _a.settings) === null || _b === void 0 ? void 0 : _b.optimizer) === null || _c === void 0 ? void 0 : _c.enabled) === true &&
            semver_1.default.satisfies(this.solidityConfig.version, SOLC_BUG_9573_VERSIONS));
    }
    merge(job) {
        const { isEqual } = require("lodash");
        errors_1.assertHardhatInvariant(isEqual(this.solidityConfig, job.getSolcConfig()), "Merging jobs with different solidity configurations");
        const mergedJobs = new CompilationJob(job.getSolcConfig());
        for (const file of this.getResolvedFiles()) {
            mergedJobs.addFileToCompile(file, this.emitsArtifacts(file));
        }
        for (const file of job.getResolvedFiles()) {
            mergedJobs.addFileToCompile(file, job.emitsArtifacts(file));
        }
        return mergedJobs;
    }
    getSolcConfig() {
        return this.solidityConfig;
    }
    isEmpty() {
        return this._filesToCompile.size === 0;
    }
    getResolvedFiles() {
        return [...this._filesToCompile.values()].map((x) => x.file);
    }
    /**
     * Check if the given file emits artifacts.
     *
     * If no file is given, check if *some* file in the job emits artifacts.
     */
    emitsArtifacts(file) {
        const fileToCompile = this._filesToCompile.get(file.sourceName);
        errors_1.assertHardhatInvariant(fileToCompile !== undefined, `File '${file.sourceName}' does not exist in this compilation job`);
        return fileToCompile.emitsArtifacts;
    }
}
exports.CompilationJob = CompilationJob;
function mergeCompilationJobs(jobs, isMergeable) {
    const { flatten } = require("lodash");
    const jobsMap = new Map();
    for (const job of jobs) {
        const mergedJobs = jobsMap.get(job.getSolcConfig());
        if (isMergeable(job)) {
            if (mergedJobs === undefined) {
                jobsMap.set(job.getSolcConfig(), [job]);
            }
            else if (mergedJobs.length === 1) {
                const newJob = mergedJobs[0].merge(job);
                jobsMap.set(job.getSolcConfig(), [newJob]);
            }
            else {
                errors_1.assertHardhatInvariant(false, "More than one mergeable job was added for the same configuration");
            }
        }
        else {
            if (mergedJobs === undefined) {
                jobsMap.set(job.getSolcConfig(), [job]);
            }
            else {
                jobsMap.set(job.getSolcConfig(), [...mergedJobs, job]);
            }
        }
    }
    return flatten([...jobsMap.values()]);
}
/**
 * Creates a list of compilation jobs from a dependency graph. *This function
 * assumes that the given graph is a connected component*.
 * Returns the list of compilation jobs on success, and a list of
 * non-compilable files on failure.
 */
async function createCompilationJobsFromConnectedComponent(connectedComponent, getFromFile) {
    var _a;
    const compilationJobs = [];
    const errors = {};
    for (const file of connectedComponent.getResolvedFiles()) {
        const compilationJobOrError = await getFromFile(file);
        if (isCompilationJobCreationError(compilationJobOrError)) {
            log(`'${file.absolutePath}' couldn't be compiled. Reason: '${compilationJobOrError}'`);
            errors[compilationJobOrError] = (_a = errors[compilationJobOrError]) !== null && _a !== void 0 ? _a : [];
            errors[compilationJobOrError].push(file.sourceName);
            continue;
        }
        compilationJobs.push(compilationJobOrError);
    }
    const jobs = mergeCompilationJobsWithBug(compilationJobs);
    return { jobs, errors };
}
exports.createCompilationJobsFromConnectedComponent = createCompilationJobsFromConnectedComponent;
async function createCompilationJobFromFile(dependencyGraph, file, solidityConfig) {
    const directDependencies = dependencyGraph.getDependencies(file);
    const transitiveDependencies = dependencyGraph.getTransitiveDependencies(file);
    const compilerConfig = getCompilerConfigForFile(file, directDependencies, transitiveDependencies, solidityConfig);
    // if the config cannot be obtained, we just return the failure
    if (isCompilationJobCreationError(compilerConfig)) {
        return compilerConfig;
    }
    log(`File '${file.absolutePath}' will be compiled with version '${compilerConfig.version}'`);
    const compilationJob = new CompilationJob(compilerConfig);
    compilationJob.addFileToCompile(file, true);
    for (const dependency of transitiveDependencies) {
        log(`File '${dependency.absolutePath}' added as dependency of '${file.absolutePath}'`);
        compilationJob.addFileToCompile(dependency, false);
    }
    return compilationJob;
}
exports.createCompilationJobFromFile = createCompilationJobFromFile;
/**
 * Merge compilation jobs affected by the solc #9573 bug
 */
function mergeCompilationJobsWithBug(compilationJobs) {
    return mergeCompilationJobs(compilationJobs, (job) => job.hasSolc9573Bug());
}
exports.mergeCompilationJobsWithBug = mergeCompilationJobsWithBug;
/**
 * Merge compilation jobs not affected by the solc #9573 bug
 */
function mergeCompilationJobsWithoutBug(compilationJobs) {
    return mergeCompilationJobs(compilationJobs, (job) => !job.hasSolc9573Bug());
}
exports.mergeCompilationJobsWithoutBug = mergeCompilationJobsWithoutBug;
/**
 * Return the compiler config with the newest version that satisfies the given
 * version ranges, or a value indicating why the compiler couldn't be obtained.
 */
function getCompilerConfigForFile(file, directDependencies, transitiveDependencies, solidityConfig) {
    var _a;
    const { uniq } = require("lodash");
    const transitiveDependenciesVersionPragmas = transitiveDependencies.map((x) => x.content.versionPragmas);
    const versionRange = uniq([
        ...file.content.versionPragmas,
        ...transitiveDependenciesVersionPragmas,
    ]).join(" ");
    const overrides = (_a = solidityConfig.overrides) !== null && _a !== void 0 ? _a : {};
    const overriddenCompiler = overrides[file.sourceName];
    // if there's an override, we only check that
    if (overriddenCompiler !== undefined) {
        if (!semver_1.default.satisfies(overriddenCompiler.version, versionRange)) {
            return getCompilationJobCreationError(file, directDependencies, [overriddenCompiler.version], true);
        }
        return overriddenCompiler;
    }
    // if there's no override, we find a compiler that matches the version range
    const compilerVersions = solidityConfig.compilers.map((x) => x.version);
    const matchingVersion = semver_1.default.maxSatisfying(compilerVersions, versionRange);
    if (matchingVersion === null) {
        return getCompilationJobCreationError(file, directDependencies, compilerVersions, false);
    }
    const matchingConfig = solidityConfig.compilers.find((x) => x.version === matchingVersion);
    return matchingConfig;
}
function getCompilationJobCreationError(file, directDependencies, compilerVersions, overriden) {
    const fileVersionRange = file.content.versionPragmas.join(" ");
    if (semver_1.default.maxSatisfying(compilerVersions, fileVersionRange) === null) {
        return overriden
            ? builtin_tasks_1.CompilationJobCreationError.INCOMPATIBLE_OVERRIDEN_SOLC_VERSION
            : builtin_tasks_1.CompilationJobCreationError.NO_COMPATIBLE_SOLC_VERSION_FOUND;
    }
    for (const dependency of directDependencies) {
        const dependencyVersionRange = dependency.content.versionPragmas.join(" ");
        if (!semver_1.default.intersects(fileVersionRange, dependencyVersionRange)) {
            return builtin_tasks_1.CompilationJobCreationError.IMPORTS_INCOMPATIBLE_FILE;
        }
    }
    return builtin_tasks_1.CompilationJobCreationError.OTHER_ERROR;
}
//# sourceMappingURL=compilation-job.js.map