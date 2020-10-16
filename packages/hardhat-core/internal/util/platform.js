"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getRequireCachedFiles() {
    return Object.keys(require.cache).filter((p) => !p.startsWith("internal") && (p.endsWith(".js") || p.endsWith(".ts")));
}
exports.getRequireCachedFiles = getRequireCachedFiles;
//# sourceMappingURL=platform.js.map