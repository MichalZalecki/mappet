"use strict";
var lodash_1 = require("lodash");
function always(value) {
    return value;
}
exports.always = always;
function accept(value) {
    return true;
}
exports.accept = accept;
function mappet(schema, filter) {
    if (filter === void 0) { filter = accept; }
    return function (object) {
        return schema
            .map(function (_a) {
            var dest = _a[0], source = _a[1], _b = _a[2], modifier = _b === void 0 ? always : _b;
            return [dest, lodash_1.get(object, source), modifier];
        })
            .filter(function (args) { return filter.apply(void 0, args); })
            .reduce(function (akk, _a) {
            var dest = _a[0], value = _a[1], modifier = _a[2];
            return lodash_1.set(akk, dest, modifier(value));
        }, {});
    };
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mappet;
//# sourceMappingURL=mappet.js.map