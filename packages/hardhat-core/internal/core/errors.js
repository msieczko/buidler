"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const caller_package_1 = require("../util/caller-package");
const strings_1 = require("../util/strings");
const errors_list_1 = require("./errors-list");
const inspect = Symbol.for("nodejs.util.inspect.custom");
class CustomError extends Error {
    constructor(message, parent) {
        // WARNING: Using super when extending a builtin class doesn't work well
        // with TS if you are compiling to a version of JavaScript that doesn't have
        // native classes. We don't do that in Hardhat.
        //
        // For more info about this, take a look at: https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
        super(message);
        this.parent = parent;
        this.name = this.constructor.name;
        // We do this to avoid including the constructor in the stack trace
        if (Error.captureStackTrace !== undefined) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
    [inspect]() {
        var _a, _b, _c, _d, _e;
        let str = this.stack;
        if (this.parent !== undefined) {
            const parentAsAny = this.parent;
            const causeString = (_e = (_d = (_b = (_a = parentAsAny[inspect]) === null || _a === void 0 ? void 0 : _a.call(parentAsAny)) !== null && _b !== void 0 ? _b : (_c = parentAsAny.inspect) === null || _c === void 0 ? void 0 : _c.call(parentAsAny)) !== null && _d !== void 0 ? _d : parentAsAny.stack) !== null && _e !== void 0 ? _e : parentAsAny.toString();
            const nestedCauseStr = causeString
                .split("\n")
                .map((line) => `    ${line}`)
                .join("\n")
                .trim();
            str += `

    Caused by: ${nestedCauseStr}`;
        }
        return str;
    }
}
exports.CustomError = CustomError;
class HardhatError extends CustomError {
    constructor(errorDescriptor, messageArguments = {}, parentError) {
        const prefix = `${errors_list_1.getErrorCode(errorDescriptor)}: `;
        const formattedMessage = applyErrorMessageTemplate(errorDescriptor.message, messageArguments);
        super(prefix + formattedMessage, parentError);
        this.errorDescriptor = errorDescriptor;
        this.number = errorDescriptor.number;
        this.messageArguments = messageArguments;
        this._isHardhatError = true;
        Object.setPrototypeOf(this, HardhatError.prototype);
    }
    static isHardhatError(other) {
        return (other !== undefined && other !== null && other._isHardhatError === true);
    }
    static isHardhatErrorType(other, descriptor) {
        return (HardhatError.isHardhatError(other) &&
            other.errorDescriptor.number === descriptor.number);
    }
}
exports.HardhatError = HardhatError;
/**
 * This class is used to throw errors from hardhat plugins made by third parties.
 */
class HardhatPluginError extends CustomError {
    constructor(pluginNameOrMessage, messageOrParent, parent) {
        if (typeof messageOrParent === "string") {
            super(messageOrParent, parent);
            this.pluginName = pluginNameOrMessage;
        }
        else {
            super(pluginNameOrMessage, messageOrParent);
            this.pluginName = caller_package_1.getClosestCallerPackage();
        }
        this._isHardhatPluginError = true;
        Object.setPrototypeOf(this, HardhatPluginError.prototype);
    }
    static isHardhatPluginError(other) {
        return (other !== undefined &&
            other !== null &&
            other._isHardhatPluginError === true);
    }
}
exports.HardhatPluginError = HardhatPluginError;
class NomicLabsHardhatPluginError extends HardhatPluginError {
    /**
     * This class is used to throw errors from *core* hardhat plugins. If you are
     * developing a third-party plugin, use HardhatPluginError instead.
     */
    constructor(pluginName, message, parent, shouldBeReported = false) {
        super(pluginName, message, parent);
        this.shouldBeReported = shouldBeReported;
        this._isNomicLabsHardhatPluginError = true;
        Object.setPrototypeOf(this, NomicLabsHardhatPluginError.prototype);
    }
    static isNomicLabsHardhatPluginError(other) {
        return (other !== undefined &&
            other !== null &&
            other._isNomicLabsHardhatPluginError === true);
    }
}
exports.NomicLabsHardhatPluginError = NomicLabsHardhatPluginError;
/**
 * This function applies error messages templates like this:
 *
 *  - Template is a string which contains a variable tags. A variable tag is a
 *    a variable name surrounded by %. Eg: %plugin1%
 *  - A variable name is a string of alphanumeric ascii characters.
 *  - Every variable tag is replaced by its value.
 *  - %% is replaced by %.
 *  - Values can't contain variable tags.
 *  - If a variable is not present in the template, but present in the values
 *    object, an error is thrown.
 *
 * @param template The template string.
 * @param values A map of variable names to their values.
 */
function applyErrorMessageTemplate(template, values) {
    return _applyErrorMessageTemplate(template, values, false);
}
exports.applyErrorMessageTemplate = applyErrorMessageTemplate;
function _applyErrorMessageTemplate(template, values, isRecursiveCall) {
    if (!isRecursiveCall) {
        for (const variableName of Object.keys(values)) {
            if (variableName.match(/^[a-zA-Z][a-zA-Z0-9]*$/) === null) {
                throw new HardhatError(errors_list_1.ERRORS.INTERNAL.TEMPLATE_INVALID_VARIABLE_NAME, {
                    variable: variableName,
                });
            }
            const variableTag = `%${variableName}%`;
            if (!template.includes(variableTag)) {
                throw new HardhatError(errors_list_1.ERRORS.INTERNAL.TEMPLATE_VARIABLE_TAG_MISSING, {
                    variable: variableName,
                });
            }
        }
    }
    if (template.includes("%%")) {
        return template
            .split("%%")
            .map((part) => _applyErrorMessageTemplate(part, values, true))
            .join("%");
    }
    for (const variableName of Object.keys(values)) {
        let value;
        if (values[variableName] === undefined) {
            value = "undefined";
        }
        else if (values[variableName] === null) {
            value = "null";
        }
        else {
            value = values[variableName].toString();
        }
        if (value === undefined) {
            value = "undefined";
        }
        const variableTag = `%${variableName}%`;
        if (value.match(/%([a-zA-Z][a-zA-Z0-9]*)?%/) !== null) {
            throw new HardhatError(errors_list_1.ERRORS.INTERNAL.TEMPLATE_VALUE_CONTAINS_VARIABLE_TAG, { variable: variableName });
        }
        template = strings_1.replaceAll(template, variableTag, value);
    }
    return template;
}
function assertHardhatInvariant(invariant, message) {
    if (!invariant) {
        throw new HardhatError(errors_list_1.ERRORS.GENERAL.ASSERTION_ERROR, { message });
    }
}
exports.assertHardhatInvariant = assertHardhatInvariant;
//# sourceMappingURL=errors.js.map