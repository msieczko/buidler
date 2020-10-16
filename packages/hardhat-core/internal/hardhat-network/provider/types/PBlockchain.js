"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
function toBlockchain(pb) {
    async function getBlock(blockTag) {
        const block = await pb.getBlock(blockTag);
        if (block === undefined) {
            // tslint:disable-next-line only-hardhat-error
            throw new Error("Block not found");
        }
    }
    function delBlock(blockHash, cb) {
        try {
            pb.deleteBlock(blockHash);
        }
        catch (e) {
            cb(e);
            return;
        }
        cb(null);
    }
    return {
        getBlock: util_1.callbackify(getBlock),
        putBlock: util_1.callbackify(pb.addBlock.bind(pb)),
        delBlock,
        getDetails,
        iterator,
    };
}
exports.toBlockchain = toBlockchain;
function getDetails(_, cb) {
    cb(null);
}
function iterator() {
    // tslint:disable-next-line only-hardhat-error
    throw new Error(".iterator() is not supported");
}
//# sourceMappingURL=PBlockchain.js.map