# mappet

[![CircleCI](https://circleci.com/gh/MichalZalecki/mappet.svg?style=svg)](https://circleci.com/gh/MichalZalecki/mappet)

Lightweight, composable mappers for object transformations/normalization.

***
[API Docs](https://michalzalecki.github.io/mappet) | [Examples](#examples)
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

### Basic

Simple value to value transformation

```js
const schema = {
  firstName: "first_name",
  cardNumber: "card.number",
};
const mapper = mappet(schema);
const source = {
  first_name: "Michal",
  last_name: "Zalecki",
  card: {
    number: "5555-5555-5555-4444",
  },
};
const result = mapper(source);
// {
//   firstName: "Michal",
//   cardNumber: "5555-5555-5555-4444",
// }
```

### Mapping values

Schema entries can be also option objects of `path`, `modifier`, and `include`. Modifier accepts selected value and original source object.

```js
const formatDate = (date, source) => moment(date).format(source.country === "us" ? "MM/DD/YY" : "DD/MM/YY");
const upperCase = v => v.toUpperCase();

const schema = {
  country: { path: "country", modifier: upperCase },
  date: { path: "date", modifier: formatDate },
};
const mapper = mappet(schema);
const source = {
  country: "gb",
  date: "2016-07-30",
};
const result = mapper(source);
// {
//   country: "GB",
//   date: "30/07/16",
// }
```

### Filtering entries

Using `include` you can control which values should be keept and what dropped.

```js
const isGift = (value, source) => source.isGift;

const schema = {
  quantity: ["quantity"],
  message: { path: "giftMessage", include: isGift },
  remind_before_renewing: { path: "remindBeforeRenewingGift", include: isGift },
};
const mapper = mappet(schema);
const source = {
  quantity: 3,
  isGift: false,
  giftMessage: "All best!",
  remindBeforeRenewingGift: true,
};
const result = mapper(source);
// {
//   quantity: 3,
// };
```

### Composing mappers

Mappers are just closures. It's easy to combine them using modifiers.

```js
const userSchema = {
  firstName: "first_name",
  lastName: "last_name",
};
const userMapper = mappet(userSchema);

const usersSchema = {
  totalCount: "total_count",
  users: { path: "items", modifier: users => users.map(userMapper) },
};
const usersMapper = mappet(usersSchema);

const source = {
  total_count: 5,
  items: [
    { first_name: "Michal", last_name: "Zalecki" },
    { first_name: "John", last_name: "Doe" },
  ],
};
const result = usersMapper(source);
// {
//   totalCount: 5,
//   users: [
//     { firstName: "Michal", lastName: "Zalecki" },
//     { firstName: "John", lastName: "Doe" },
//   ],
// }
```

### Strict mode

Mappers in strict mode will throw exception when value is not found on source object.

```js
const schema = {
  firstName: "first_name",
  lastName: "last_name",
};
const mapper = mappet(schema, { strict: true });
const source = {
  first_name: "Michal",
};
const result = mapper(source);
// Uncaught Mappet: last_name not found
```

You can specify mapper name for easier debugging.

```js
const userMapper = mappet(schema, { strictMode: true, name: "User Mapper" });
const user = mapper(source);
// Uncaught User Mapper: last_name not found
```

### Greedy mode

Mappers in greedy mode will copy all properties from source object.

```js
const schema = {
  last_name: { path: "last_name", modifier: str => str.toUpperCase() },
};
const mapper = mappet(schema, { greedy: true });
const source = {
  first_name: "Michal",
  last_name: "Zalecki",
  email: "example@michalzalecki.com",
};
const actual = mapper(source);
// {
//   first_name: "Michal",
//   last_name: "ZALECKI",
//   email: "example@michalzalecki.com",
// }
```

See [tests](src/mappet.spec.ts) for more examples.
