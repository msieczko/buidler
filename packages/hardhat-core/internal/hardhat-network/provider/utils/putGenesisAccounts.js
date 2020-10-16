"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const makeAccount_1 = require("./makeAccount");
async function putGenesisAccounts(stateManager, genesisAccounts) {
    for (const ga of genesisAccounts) {
        const { address, account } = makeAccount_1.makeAccount(ga);
        await stateManager.putAccount(address, account);
    }
}
exports.putGenesisAccounts = putGenesisAccounts;
//# sourceMappingURL=putGenesisAccounts.js.map