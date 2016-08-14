import * as tape from "tape";
import mappet, { Filter, Modifier, Result, Schema, Source } from "../lib/mappet";
import * as moment from "moment";

function simpleMapping(t: tape.Test) {
  const schema: Schema  = [
    ["firstName", "first_name"],
    ["lastName", "last_name"],
    ["cardNumber", "card.number"],
  ];
  const mapper = mappet(schema);
  const source = {
    first_name: "Michal",
    last_name: "Zalecki",
    card: {
      number: "5555-5555-5555-4444",
    },
  };
  const actual = mapper(source);
  const expected = {
    firstName: "Michal",
    lastName: "Zalecki",
    cardNumber: "5555-5555-5555-4444",
  };
  t.deepEqual(actual, expected, "performs simple mapping based on schema");
}

function notFoundAsUndefined(t: tape.Test) {
  const simpleSchema: Schema  = [
    ["firstName", "first_name"],
    ["lastName", "last_name"],
  ];
  const mapper = mappet(simpleSchema);
  const source = {
    first_name: "Michal",
  };
  const actual = mapper(source);
  const expected: {[key: string]: any} = {
    firstName: "Michal",
    lastName: undefined,
  };
  t.deepEqual(actual, expected, "not found source elements are undefined");
}

function thorwErrorOnNotFound(t: tape.Test) {
  const schema: Schema  = [
    ["firstName", "first_name"],
    ["lastName", "last_name"],
  ];
  const mapper = mappet(schema, { strictMode: true });
  const source = {
    first_name: "Michal",
  };
  t.throws(
    () => { mapper(source); },
    /Mappet: last_name not found/,
    "throw on not found in strictMode"
  );
}

function customMapperName(t: tape.Test) {
  const schema: Schema  = [
    ["firstName", "first_name"],
    ["lastName", "last_name"],
  ];
  const myMapper = mappet(schema, { strictMode: true, name: "myMapper" });
  const source = {
    first_name: "Michal",
  };
  t.throws(
    () => { myMapper(source); },
    /myMapper: last_name not found/,
    "sets custom mapper name for easier debugging"
  );
}

function modifyEntry(t: tape.Test) {
  const emptyStringToNull: Modifier = v => v === "" ? null : v;
  const upperCase: Modifier = v => v.toUpperCase();

  const schema: Schema  = [
    ["firstName", "first_name", upperCase],
    ["lastName", "last_name", emptyStringToNull],
  ];
  const mapper = mappet(schema);
  const source: Source = {
    first_name: "Michal",
    last_name: "",
  };
  const actual = mapper(source);
  const expected: Result = {
    firstName: "MICHAL",
    lastName: null,
  };
  t.deepEqual(actual, expected, "allows for modifing an entry with modifier");
}

function modifyEntryBasedOnSource(t: tape.Test) {
  interface MySource {
    country: string;
    date: string;
  }

  const formatDate: Modifier = (date: string, source: MySource) =>
    source.country === "us" ? moment(date).format("MM/DD/YY") : moment(date).format("DD/MM/YY");

  const schema: Schema = [
    ["country", "country"],
    ["date", "date", formatDate],
  ];
  const mapper = mappet(schema);

  const sourceUS = {
    country: "us",
    date: "2016-07-30",
  };
  const actualUS = mapper(sourceUS);
  const expectedUS = {
    country: "us",
    date: "07/30/16",
  };
  t.deepEqual(actualUS, expectedUS, "allows for mapping depending on source");

  const sourceGB = {
    country: "gb",
    date: "2016-07-30",
  };
  const actualGB = mapper(sourceGB);
  const expectedGB = {
    country: "gb",
    date: "30/07/16",
  };
  t.deepEqual(actualGB, expectedGB, "allows for mapping depending on source");
}

function filterEntry(t: tape.Test) {
  const skipNull: Filter = v => v === null ? false : true;

  const schema: Schema  = [
    ["firstName", "first_name", undefined, skipNull],
    ["lastName", "last_name", undefined, skipNull],
  ];
  const mapper = mappet(schema);
  const source: Source = {
    first_name: "Michal",
    last_name: null,
  };
  const actual = mapper(source);
  const expected: Result = {
    firstName: "Michal",
  };
  t.deepEqual(actual, expected, "allows for filtering an entry with filter");
}

function filterBasedOnSource(t: tape.Test) {
  interface MySource {
    quantity: number;
    isGift: boolean;
    gift: { message: string, remind_before_renewing: boolean };
  }

  const skipIfNotAGift: Filter = (value: any, source: MySource) => source.isGift;
  const skipIfGift: Filter = (value: any, source: MySource) => !source.isGift;
  const mapToNull: Modifier = () => null;

  const schema: Schema = [
    ["quantity", "quantity"],
    ["gift.message", "giftMessage", undefined, skipIfNotAGift],
    ["gift.remind_before_renewing", "remindBeforeRenewingGift", undefined, skipIfNotAGift],
    ["gift", "gift", mapToNull, skipIfGift],
  ];

  const mapper = mappet(schema);

  const sourceNotGift: Source = {
    quantity: 3,
    isGift: false,
    giftMessage: "All best!",
    remindBeforeRenewingGift: true,
  };
  const actualNotGift = mapper(sourceNotGift);
  const expectedNotGift: Result = {
    quantity: 3,
    gift: null,
  };
  t.deepEqual(actualNotGift, expectedNotGift, "allows for filtering depending on source");

  const sourceGift: Source = {
    quantity: 3,
    isGift: true,
    giftMessage: "All best!",
    remindBeforeRenewingGift: true,
  };
  const actualGift = mapper(sourceGift);
  const expectedGift: Result = {
    quantity: 3,
    gift: {
      message: "All best!",
      remind_before_renewing: true,
    },
  };
  t.deepEqual(actualGift, expectedGift, "allows for filtering depending on source");
}

function composeMappers(t: tape.Test) {
  const userSchema: Schema = [
    ["firstName", "first_name"],
    ["lastName", "last_name"],
  ];
  const userMapper = mappet(userSchema);

  const usersSchema: Schema = [
    ["totalCount", "total_count"],
    ["users", "items", users => users.map(userMapper)],
  ];
  const usersMapper = mappet(usersSchema);

  const source = {
    total_count: 5,
    items: [
      { first_name: "Michal", last_name: "Zalecki" },
      { first_name: "Foo", last_name: "Bar" },
    ],
  };
  const actual = usersMapper(source);
  const expected = {
    totalCount: 5,
    users: [
      { firstName: "Michal", lastName: "Zalecki" },
      { firstName: "Foo", lastName: "Bar" },
    ],
  };
  t.deepEqual(actual, expected, "allows for composing mappers");
}

tape("mappet", (t: tape.Test) => {
  t.plan(11);
  simpleMapping(t);
  notFoundAsUndefined(t);
  thorwErrorOnNotFound(t);
  customMapperName(t);
  modifyEntry(t);
  modifyEntryBasedOnSource(t);
  filterEntry(t);
  filterBasedOnSource(t);
  composeMappers(t);
});
