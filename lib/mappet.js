"use strict";
var get = require("lodash/get");
var set = require("lodash/set");
/**
 * Default modifier function which returns passed value without any modifications
 *
 * @param value - Value which will be returned
 */
function identity(value) {
    return value;
}
/**
 * Default filter function which accepts each entry
 */
function accept() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
    }
    return true;
}
/**
 * Factory for creating mappers functions
 *
 * @param schema - Mapper schema
 * @param filter - Determine whether entry should be keept or omitted
 * @returns Mapper function
 */
function mappet(schema, strictMode) {
    if (strictMode === void 0) { strictMode = false; }
    return function (source) {
        return schema
            .map(function (_a) {
            var destPath = _a[0], sourcePath = _a[1], _b = _a[2], modifier = _b === void 0 ? identity : _b, _c = _a[3], filter = _c === void 0 ? accept : _c;
            var value = get(source, sourcePath);
            if (strictMode && value === undefined)
                throw "Mappet: " + sourcePath + " not found";
            return [destPath, value, modifier, filter];
        })
            .filter(function (_a) {
            var destPath = _a[0], value = _a[1], modifier = _a[2], filter = _a[3];
            return filter(value, source);
        })
            .map(function (_a) {
            var destPath = _a[0], value = _a[1], modifier = _a[2];
            return [destPath, modifier(value, source)];
        })
            .reduce(function (akk, _a) {
            var destPath = _a[0], value = _a[1];
            return set(akk, destPath, value);
        }, {});
    };
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mappet;
//# sourceMappingURL=mappet.js.map