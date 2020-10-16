"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This function returns a number that should be safe to consider as the
 * largest possible reorg in a network.
 *
 * If there's not such a number, or we aren't aware of it, this function
 * returns undefined.
 */
function getLargestPossibleReorg(networkId) {
    // mainnet
    if (networkId === 1) {
        return 5;
    }
    // Kovan
    if (networkId === 42) {
        return 5;
    }
    // Goerli
    if (networkId === 5) {
        return 5;
    }
    // Rinkeby
    if (networkId === 4) {
        return 5;
    }
}
exports.getLargestPossibleReorg = getLargestPossibleReorg;
exports.FALLBACK_MAX_REORG = 30;
//# sourceMappingURL=reorgs-protection.js.map