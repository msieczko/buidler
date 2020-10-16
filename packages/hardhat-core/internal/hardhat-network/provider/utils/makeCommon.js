"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethereumjs_common_1 = __importDefault(require("ethereumjs-common"));
const ethereumjs_util_1 = require("ethereumjs-util");
const date_1 = require("../../../util/date");
const getCurrentTimestamp_1 = require("./getCurrentTimestamp");
function makeCommon({ initialDate, chainId, networkId, networkName, blockGasLimit, hardfork, }, stateTrie) {
    const initialBlockTimestamp = initialDate !== undefined
        ? date_1.dateToTimestampSeconds(initialDate)
        : getCurrentTimestamp_1.getCurrentTimestamp();
    return ethereumjs_common_1.default.forCustomChain("mainnet", {
        chainId,
        networkId,
        name: networkName,
        genesis: {
            timestamp: `0x${initialBlockTimestamp.toString(16)}`,
            hash: "0x",
            gasLimit: blockGasLimit,
            difficulty: 1,
            nonce: "0x42",
            extraData: "0x1234",
            stateRoot: ethereumjs_util_1.bufferToHex(stateTrie.root),
        },
    }, hardfork);
}
exports.makeCommon = makeCommon;
//# sourceMappingURL=makeCommon.js.map