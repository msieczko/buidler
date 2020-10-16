"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethereumjs_util_1 = require("ethereumjs-util");
const t = __importStar(require("io-ts"));
const errors_1 = require("../errors");
const input_1 = require("../input");
const output_1 = require("../output");
// tslint:disable only-hardhat-error
class EvmModule {
    constructor(_node) {
        this._node = _node;
    }
    async processRequest(method, params = []) {
        switch (method) {
            case "evm_increaseTime":
                return this._increaseTimeAction(...this._increaseTimeParams(params));
            case "evm_setNextBlockTimestamp":
                return this._setNextBlockTimestampAction(...this._setNextBlockTimestampParams(params));
            case "evm_mine":
                return this._mineAction(...this._mineParams(params));
            case "evm_revert":
                return this._revertAction(...this._revertParams(params));
            case "evm_snapshot":
                return this._snapshotAction(...this._snapshotParams(params));
        }
        throw new errors_1.MethodNotFoundError(`Method ${method} not found`);
    }
    // evm_setNextBlockTimestamp
    _setNextBlockTimestampParams(params) {
        return input_1.validateParams(params, t.number);
    }
    async _setNextBlockTimestampAction(timestamp) {
        const latestBlock = await this._node.getLatestBlock();
        const increment = new ethereumjs_util_1.BN(timestamp).sub(new ethereumjs_util_1.BN(latestBlock.header.timestamp));
        if (increment.lte(new ethereumjs_util_1.BN(0))) {
            throw new errors_1.InvalidInputError(`Timestamp ${timestamp} is lower than previous block's timestamp` +
                ` ${new ethereumjs_util_1.BN(latestBlock.header.timestamp).toNumber()}`);
        }
        await this._node.setNextBlockTimestamp(new ethereumjs_util_1.BN(timestamp));
        return timestamp.toString();
    }
    // evm_increaseTime
    _increaseTimeParams(params) {
        return input_1.validateParams(params, t.number);
    }
    async _increaseTimeAction(increment) {
        await this._node.increaseTime(new ethereumjs_util_1.BN(increment));
        const totalIncrement = await this._node.getTimeIncrement();
        // This RPC call is an exception: it returns a number in decimal
        return totalIncrement.toString();
    }
    // evm_mine
    _mineParams(params) {
        if (params.length === 0) {
            params.push(0);
        }
        return input_1.validateParams(params, t.number);
    }
    async _mineAction(timestamp) {
        // if timestamp is specified, make sure it is bigger than previous
        // block's timestamp
        if (timestamp !== 0) {
            const latestBlock = await this._node.getLatestBlock();
            const increment = new ethereumjs_util_1.BN(timestamp).sub(new ethereumjs_util_1.BN(latestBlock.header.timestamp));
            if (increment.lte(new ethereumjs_util_1.BN(0))) {
                throw new errors_1.InvalidInputError(`Timestamp ${timestamp} is lower than previous block's timestamp` +
                    ` ${new ethereumjs_util_1.BN(latestBlock.header.timestamp).toNumber()}`);
            }
        }
        await this._node.mineEmptyBlock(new ethereumjs_util_1.BN(timestamp));
        return output_1.numberToRpcQuantity(0);
    }
    // evm_revert
    _revertParams(params) {
        return input_1.validateParams(params, input_1.rpcQuantity);
    }
    async _revertAction(snapshotId) {
        return this._node.revertToSnapshot(snapshotId.toNumber());
    }
    // evm_snapshot
    _snapshotParams(params) {
        return [];
    }
    async _snapshotAction() {
        const snapshotId = await this._node.takeSnapshot();
        return output_1.numberToRpcQuantity(snapshotId);
    }
}
exports.EvmModule = EvmModule;
//# sourceMappingURL=evm.js.map