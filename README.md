# mappet

[![CircleCI](https://circleci.com/gh/MichalZalecki/mappet.svg?style=svg)](https://circleci.com/gh/MichalZalecki/mappet)

Lightweight, composable mappers for object transformations/normalization.

***
[API Docs](https://michalzalecki.github.io/mappet)
|
[Examples](#examples)
***

## Installation ([npm](https://www.npmjs.com/package/mappet))

```
npm i -S mappet
```

## Use cases

* Fault tolerant object transformations, no more `Cannot read property of undefined`.
* Normalizing API responses shape and key names e.g. to camelCase or flattening nested payloads
* Preparing nested API request payloads from flat form data
* Filtering object entries e.g. omitting entries with `undefined` value
* Per field modifications e.g. `null` to empty string to make React inputs happy

## Examples

### Simple transformation

```js
const simpleSchema = [
  // ["path.to.destination", "path.to.source"]
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

const result = simpleMapper(source);

//  {
//    firstName: "Michal",
//    lastName: undefined,
//    cardNumber: "5555-5555-5555-4444",
//  }
```

### Skip undefined fields

```js
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

const result = skipUndefinedMapper(source);

//  {
//    firstName: "Michal",
//    cardNumber: "5555-5555-5555-4444"
//  }
```

### Per field modification

```js
const uppercase = text => text.toUpperCase();

const nullToEmptyString = value => value === null ? "" : value;

const uppercaseSchema = [
  // ["path.to.destination", "path.to.source", modifierFn]
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

const result = uppercaseMapper(source);

//  {
//    firstName: "MICHAL",
//    age: 21,
//    nickname: ""
//  }
```

### Mappers composition

```js
const commentSchema = [
  ["nickname", "nickname"],
  ["upvotesCount", "upvotes_count"]
];

const commentMapper = mappet(commentSchema);

const blogSchema = [
  ["title", "title"],
  ["createdAt", "meta.created_at", date => moment(date)],
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

//  {
//    title: "Foo Bar",
//    createdAt: Moment {_isAMomentObject: true, _i: "2016-12-12 0:00", ...},
//    comments: [
//     { nickname: "Foo", upvotesCount: 10 },
//     { nickname: "Bar", upvotesCount: 20 },
//    ]
//  }
```

## TODO v1.0.0

* [x] Strict checks mode - throw error when source value is undefined (breaking change)
* [x] Per entry filter instead of per mapper (breaking change)
* [x] Pass all values as 2. param to modifier
* [ ] Get rid of lodash dependency
* [ ] Use UMD modules format
* [ ] Add linting
