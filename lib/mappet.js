"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
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
function always() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return true;
}
/**
 * Factory for creating mappers functions
 *
 * @param schema - Mapper schema
 * @param options - Mapper configuration
 * @returns Mapper function
 */
function mappet(schema, options) {
    if (options === void 0) { options = {}; }
    var _a = options.strictMode, strictMode = _a === void 0 ? false : _a, _b = options.greedyMode, greedyMode = _b === void 0 ? false : _b, _c = options.name, name = _c === void 0 ? "Mappet" : _c;
    return function (source) {
        var base = greedyMode === true ? lodash_1.clone(source) : {};
        return schema
            .map(function (_a) {
            var destPath = _a[0], sourcePath = _a[1], _b = _a[2], modifier = _b === void 0 ? identity : _b, _c = _a[3], filter = _c === void 0 ? always : _c;
            var value = lodash_1.get(source, sourcePath);
            return [destPath, sourcePath, modifier, filter, value];
        })
            .filter(function (_a) {
            var _destPath = _a[0], _sourcePath = _a[1], _modifier = _a[2], filter = _a[3], value = _a[4];
            return filter(value, source);
        })
            .map(function (_a) {
            var destPath = _a[0], sourcePath = _a[1], modifier = _a[2], _filter = _a[3], value = _a[4];
            if (strictMode === true && value === undefined) {
                throw name + ": " + sourcePath + " not found";
            }
            return [destPath, modifier(value, source)];
        })
            .reduce(function (akk, _a) {
            var destPath = _a[0], value = _a[1];
            return lodash_1.set(akk, destPath, value);
        }, base);
    };
}
exports.default = mappet;
//# sourceMappingURL=mappet.js.map