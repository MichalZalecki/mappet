"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tape = require("tape");
var mappet_1 = require("../lib/mappet");
var moment = require("moment");
function simpleMapping(t) {
    var schema = {
        firstName: "first_name",
        lastName: "last_name",
        cardNumber: "card.number",
    };
    var mapper = mappet_1.default(schema);
    var source = {
        first_name: "Michal",
        last_name: "Zalecki",
        card: {
            number: "5555-5555-5555-4444",
        },
    };
    var actual = mapper(source);
    var expected = {
        firstName: "Michal",
        lastName: "Zalecki",
        cardNumber: "5555-5555-5555-4444",
    };
    t.deepEqual(actual, expected, "performs simple mapping based on schema");
}
function notFoundAsUndefined(t) {
    var simpleSchema = {
        firstName: "first_name",
        lastName: "last_name",
    };
    var mapper = mappet_1.default(simpleSchema);
    var source = {
        first_name: "Michal",
    };
    var actual = mapper(source);
    var expected = {
        firstName: "Michal",
        lastName: undefined,
    };
    t.deepEqual(actual, expected, "not found source elements are undefined");
}
function thorwErrorOnNotFound(t) {
    var schema = {
        firstName: "first_name",
        lastName: "last_name",
    };
    var mapper = mappet_1.default(schema, { strictMode: true });
    var source = {
        first_name: "Michal",
    };
    t.throws(function () { mapper(source); }, /Mappet: last_name not found/, "throw on not found in strictMode");
}
function doNotThorwWhenFilteredOut(t) {
    var schema = {
        firstName: "first_name",
        lastName: ["last_name", undefined, function () { return false; }],
    };
    var mapper = mappet_1.default(schema, { strictMode: true });
    var source = {
        first_name: "Michal",
    };
    t.doesNotThrow(function () { mapper(source); }, "does not throw when entry should be filtered out");
}
function customMapperName(t) {
    var schema = {
        firstName: "first_name",
        lastName: "last_name",
    };
    var myMapper = mappet_1.default(schema, { strictMode: true, name: "myMapper" });
    var source = {
        first_name: "Michal",
    };
    t.throws(function () { myMapper(source); }, /myMapper: last_name not found/, "sets custom mapper name for easier debugging");
}
function modifyEntry(t) {
    var emptyStringToNull = function (v) { return v === "" ? null : v; };
    var upperCase = function (v) { return v.toUpperCase(); };
    var schema = {
        firstName: ["first_name", upperCase],
        lastName: ["last_name", emptyStringToNull],
    };
    var mapper = mappet_1.default(schema);
    var source = {
        first_name: "Michal",
        last_name: "",
    };
    var actual = mapper(source);
    var expected = {
        firstName: "MICHAL",
        lastName: null,
    };
    t.deepEqual(actual, expected, "allows for modifing an entry with modifier");
}
function modifyEntryBasedOnSource(t) {
    var formatDate = function (date, source) {
        return source.country === "us" ? moment(date).format("MM/DD/YY") : moment(date).format("DD/MM/YY");
    };
    var schema = {
        country: "country",
        date: ["date", formatDate],
    };
    var mapper = mappet_1.default(schema);
    var sourceUS = {
        country: "us",
        date: "2016-07-30",
    };
    var actualUS = mapper(sourceUS);
    var expectedUS = {
        country: "us",
        date: "07/30/16",
    };
    t.deepEqual(actualUS, expectedUS, "allows for mapping depending on source");
    var sourceGB = {
        country: "gb",
        date: "2016-07-30",
    };
    var actualGB = mapper(sourceGB);
    var expectedGB = {
        country: "gb",
        date: "30/07/16",
    };
    t.deepEqual(actualGB, expectedGB, "allows for mapping depending on source");
}
function filterEntry(t) {
    var skipNull = function (v) { return v === null ? false : true; };
    var schema = {
        firstName: ["first_name", undefined, skipNull],
        lastName: ["last_name", undefined, skipNull],
    };
    var mapper = mappet_1.default(schema);
    var source = {
        first_name: "Michal",
        last_name: null,
    };
    var actual = mapper(source);
    var expected = {
        firstName: "Michal",
    };
    t.deepEqual(actual, expected, "allows for filtering an entry with filter");
}
function filterBasedOnSource(t) {
    var skipIfNotAGift = function (value, source) { return source.isGift; };
    var schema = {
        quantity: ["quantity"],
        gift: {
            message: ["giftMessage", undefined, skipIfNotAGift],
            remind_before_renewing: ["remindBeforeRenewingGift", undefined, skipIfNotAGift],
        },
    };
    var mapper = mappet_1.default(schema);
    var sourceNotGift = {
        quantity: 3,
        isGift: false,
        giftMessage: "All best!",
        remindBeforeRenewingGift: true,
    };
    var actualNotGift = mapper(sourceNotGift);
    var expectedNotGift = {
        quantity: 3,
    };
    t.deepEqual(actualNotGift, expectedNotGift, "allows for filtering depending on source");
    var sourceGift = {
        quantity: 3,
        isGift: true,
        giftMessage: "All best!",
        remindBeforeRenewingGift: true,
    };
    var actualGift = mapper(sourceGift);
    var expectedGift = {
        quantity: 3,
        gift: {
            message: "All best!",
            remind_before_renewing: true,
        },
    };
    t.deepEqual(actualGift, expectedGift, "allows for filtering depending on source");
}
function composeMappers(t) {
    var userSchema = {
        firstName: "first_name",
        lastName: "last_name",
    };
    var userMapper = mappet_1.default(userSchema);
    var usersSchema = {
        totalCount: "total_count",
        users: ["items", function (users) { return users.map(userMapper); }],
    };
    var usersMapper = mappet_1.default(usersSchema);
    var source = {
        total_count: 5,
        items: [
            { first_name: "Michal", last_name: "Zalecki" },
            { first_name: "Foo", last_name: "Bar" },
        ],
    };
    var actual = usersMapper(source);
    var expected = {
        totalCount: 5,
        users: [
            { firstName: "Michal", lastName: "Zalecki" },
            { firstName: "Foo", lastName: "Bar" },
        ],
    };
    t.deepEqual(actual, expected, "allows for composing mappers");
}
function copyExistingProperties(t) {
    var schema = {
        last_name: ["last_name", function (str) { return str.toUpperCase(); }],
    };
    var mapper = mappet_1.default(schema, { greedyMode: true });
    var source = {
        first_name: "Michal",
        last_name: "Zalecki",
        email: "example@michalzalecki.com",
    };
    var actual = mapper(source);
    var expected = {
        first_name: "Michal",
        last_name: "ZALECKI",
        email: "example@michalzalecki.com",
    };
    t.deepEqual(actual, expected, "copy all existing properties in greedy mode");
}
tape("mappet", function (t) {
    t.plan(13);
    simpleMapping(t);
    notFoundAsUndefined(t);
    thorwErrorOnNotFound(t);
    doNotThorwWhenFilteredOut(t);
    customMapperName(t);
    modifyEntry(t);
    modifyEntryBasedOnSource(t);
    filterEntry(t);
    filterBasedOnSource(t);
    composeMappers(t);
    copyExistingProperties(t);
});
//# sourceMappingURL=mappet.test.js.map