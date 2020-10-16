"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getInputFromCompilationJob(compilationJob) {
    const sources = {};
    for (const file of compilationJob.getResolvedFiles()) {
        sources[file.sourceName] = {
            content: file.content.rawContent,
        };
    }
    const { settings } = compilationJob.getSolcConfig();
    return {
        language: "Solidity",
        sources,
        settings,
    };
}
exports.getInputFromCompilationJob = getInputFromCompilationJob;
//# sourceMappingURL=compiler-input.js.map