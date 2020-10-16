"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethereumjs_util_1 = require("ethereumjs-util");
exports.randomHash = () => ethereumjs_util_1.bufferToHex(exports.randomHashBuffer());
let next;
exports.randomHashBuffer = () => {
    if (next === undefined) {
        next = ethereumjs_util_1.keccak256("seed");
    }
    const result = next;
    next = ethereumjs_util_1.keccak256(next);
    return result;
};
exports.randomAddress = () => ethereumjs_util_1.bufferToHex(exports.randomAddressBuffer());
exports.randomAddressBuffer = () => exports.randomHashBuffer().slice(0, 20);
//# sourceMappingURL=random.js.map