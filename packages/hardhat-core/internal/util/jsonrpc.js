"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../core/errors");
const errors_list_1 = require("../core/errors-list");
function parseJsonResponse(text) {
    try {
        const json = JSON.parse(text);
        const responses = Array.isArray(json) ? json : [json];
        for (const response of responses) {
            if (!isValidJsonResponse(response)) {
                // We are sending the proper error inside the catch part of the statement.
                // We just need to raise anything here.
                // tslint:disable-next-line only-hardhat-error
                throw new Error();
            }
        }
        return json;
    }
    catch (error) {
        throw new errors_1.HardhatError(errors_list_1.ERRORS.NETWORK.INVALID_JSON_RESPONSE, {
            response: text,
        });
    }
}
exports.parseJsonResponse = parseJsonResponse;
function isValidJsonRequest(payload) {
    if (payload.jsonrpc !== "2.0") {
        return false;
    }
    if (typeof payload.id !== "number" && typeof payload.id !== "string") {
        return false;
    }
    if (typeof payload.method !== "string") {
        return false;
    }
    if (payload.params !== undefined && !Array.isArray(payload.params)) {
        return false;
    }
    return true;
}
exports.isValidJsonRequest = isValidJsonRequest;
function isValidJsonResponse(payload) {
    if (payload.jsonrpc !== "2.0") {
        return false;
    }
    if (typeof payload.id !== "number" &&
        typeof payload.id !== "string" &&
        payload.id !== null) {
        return false;
    }
    if (payload.id === null && payload.error === undefined) {
        return false;
    }
    if (payload.result === undefined && payload.error === undefined) {
        return false;
    }
    if (payload.error !== undefined) {
        if (typeof payload.error.code !== "number") {
            return false;
        }
        if (typeof payload.error.message !== "string") {
            return false;
        }
    }
    return true;
}
exports.isValidJsonResponse = isValidJsonResponse;
function isSuccessfulJsonResponse(payload) {
    return "response" in payload;
}
exports.isSuccessfulJsonResponse = isSuccessfulJsonResponse;
//# sourceMappingURL=jsonrpc.js.map