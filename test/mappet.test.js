const tape = require("tape");
const mappet = require("../lib/mappet").default;

function simpleMappingTest(t) {
  const simpleSchema = [
    ["firstName", "first_name"],
    ["lastName", "last_name"],
    ["cardNumber", "card.number"],
  ];
  const simpleMapper = mappet(simpleSchema);
  const source = {
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
  const simpleSchema = [
    ["firstName", "first_name"],
    ["lastName", "last_name"],
    ["cardNumber", "card.number"],
  ];
  const skipUndefined = (dest, value, modifier) => value !== undefined;
  const skipUndefinedMapper = mappet(simpleSchema, skipUndefined);
  const source = {
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
  const uppercase = text => text.toUpperCase();
  const nullToEmptyString = value => value === null ? "" : value;
  const uppercaseSchema = [
    ["firstName", "first_name", uppercase],
    ["age", "age"],
    ["nickname", "nickname", nullToEmptyString],
  ];
  const uppercaseMapper = mappet(uppercaseSchema);
  const source = {
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
  const commentSchema = [
    ["nickname", "nickname"],
    ["upvotesCount", "upvotes_count"]
  ];
  const commentMapper = mappet(commentSchema);
  const blogSchema = [
    ["title", "title"],
    ["createdAt", "meta.created_at"],
    ["comments", "comments", comments => comments.map(commentMapper)],
  ];
  const blogMapper = mappet(blogSchema);
  const source = {
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
  }, "allows for composing mappers")
}

tape("mappet", t => {
  t.plan(4);
  simpleMappingTest(t);
  skipingFieldsTest(t);
  modifyingFieldsTest(t);
  composingMappersTest(t);
});
