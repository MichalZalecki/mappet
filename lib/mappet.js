"use strict";
var lodash_1 = require("lodash");
function always(value) {
    return value;
}
function accept() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
    }
    return true;
}
function mappet(schema, filter) {
    var _this = this;
    if (filter === void 0) { filter = accept; }
    return function (object) {
        return schema
            .map(function (_a) {
            var dest = _a[0], source = _a[1], _b = _a[2], modifier = _b === void 0 ? always : _b;
            return [dest, lodash_1.get(object, source), modifier];
        })
            .filter(function (args) { return filter.apply(_this, args); })
            .reduce(function (akk, entry) {
            var dest = entry[0], value = entry[1], modifier = entry[2];
            return lodash_1.set(akk, dest, modifier(value));
        }, {});
    };
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mappet;
//# sourceMappingURL=mappet.js.map