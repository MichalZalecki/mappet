"use strict";
var tape = require("tape");
var mappet_1 = require("../lib/mappet");
function simpleMappingTest(t) {
    var simpleSchema = [
        ["firstName", "first_name"],
        ["lastName", "last_name"],
        ["cardNumber", "card.number"],
    ];
    var simpleMapper = mappet_1.default(simpleSchema);
    var source = {
        first_name: "Michal",
        card: {
            number: "5555-5555-5555-4444",
        },
    };
    t.deepEqual(simpleMapper(source), {
        firstName: "Michal",
        lastName: undefined,
        cardNumber: "5555-5555-5555-4444",
    }, "performs simple mapping");
}
function skipingFieldsTest(t) {
    var simpleSchema = [
        ["firstName", "first_name"],
        ["lastName", "last_name"],
        ["cardNumber", "card.number"],
    ];
    var skipUndefined = function (dest, value, modifier) { return value !== undefined; };
    var skipUndefinedMapper = mappet_1.default(simpleSchema, skipUndefined);
    var source = {
        first_name: "Michal",
        card: {
            number: "5555-5555-5555-4444",
        },
    };
    t.deepEqual(skipUndefinedMapper(source), {
        firstName: "Michal",
        cardNumber: "5555-5555-5555-4444",
    }, "allows for skipping values according to filter functor");
}
function modifyingFieldsTest(t) {
    var uppercase = function (text) { return text.toUpperCase(); };
    var nullToEmptyString = function (value) { return value === null ? "" : value; };
    var uppercaseSchema = [
        ["firstName", "first_name", uppercase],
        ["age", "age"],
        ["nickname", "nickname", nullToEmptyString],
    ];
    var uppercaseMapper = mappet_1.default(uppercaseSchema);
    var source = {
        first_name: "Michal",
        age: 21,
        nickname: null,
        card: {
            number: "5555-5555-5555-4444",
        },
    };
    t.deepEqual(uppercaseMapper(source), {
        firstName: "MICHAL",
        age: 21,
        nickname: "",
    }, "allows for per field modification");
}
function composingMappersTest(t) {
    var commentSchema = [
        ["nickname", "nickname"],
        ["upvotesCount", "upvotes_count"]
    ];
    var commentMapper = mappet_1.default(commentSchema);
    var blogSchema = [
        ["title", "title"],
        ["createdAt", "meta.created_at"],
        ["comments", "comments", function (comments) { return comments.map(commentMapper); }],
    ];
    var blogMapper = mappet_1.default(blogSchema);
    var source = {
        title: "Foo Bar",
        meta: {
            created_at: "2016-12-12 0:00"
        },
        comments: [
            { nickname: "Foo", upvotes_count: 10, created_at: "2016-12-12 1:00" },
            { nickname: "Bar", upvotes_count: 20, created_at: "2016-12-12 2:00" },
        ],
    };
    t.deepEqual(blogMapper(source), {
        title: "Foo Bar",
        createdAt: "2016-12-12 0:00",
        comments: [
            { nickname: "Foo", upvotesCount: 10 },
            { nickname: "Bar", upvotesCount: 20 },
        ],
    }, "allows for composing mappers");
}
tape("mappet", function (t) {
    t.plan(4);
    simpleMappingTest(t);
    skipingFieldsTest(t);
    modifyingFieldsTest(t);
    composingMappersTest(t);
});
//# sourceMappingURL=mappet.test.js.map