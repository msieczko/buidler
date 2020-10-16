"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethereumjs_common_1 = __importDefault(require("ethereumjs-common"));
async function makeForkCommon(forkClient, forkBlockNumber) {
    const common = new ethereumjs_common_1.default(forkClient.getNetworkId());
    common.setHardfork(common.activeHardfork(forkBlockNumber.toNumber()));
    return common;
}
exports.makeForkCommon = makeForkCommon;
//# sourceMappingURL=makeForkCommon.js.map