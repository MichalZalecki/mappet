import mappet, { Filter, Modifier, Result, Schema, Source } from "./mappet";
import * as moment from "moment";

describe("mappet", () => {
  it("performs simple mapping based on the schema", () => {
    const schema: Schema = {
      firstName: "first_name",
      lastName: "last_name",
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
    const actual = mapper(source);
    const expected = {
      firstName: "Michal",
      lastName: "Zalecki",
      cardNumber: "5555-5555-5555-4444",
    };
    expect(actual).toEqual(expected);
  });

  it("not found source elements are undefined", () => {
    const simpleSchema: Schema = {
      firstName: "first_name",
      lastName: "last_name",
    };
    const mapper = mappet(simpleSchema);
    const source = {
      first_name: "Michal",
    };
    const actual = mapper(source);
    const expected: {[key: string]: any} = {
      firstName: "Michal",
      lastName: undefined,
    };
    expect(actual).toEqual(expected);
  });

  it("throws on not found in strictMode", () => {
    const schema: Schema = {
      firstName: "first_name",
      lastName: "last_name",
    };
    const mapper = mappet(schema, { strictMode: true });
    const source = {
      first_name: "Michal",
    };
    expect(() => { mapper(source); }).toThrowError("Mappet: last_name not found");
  });

  it("does not throw when entry should be filtered out", () => {
    const schema: Schema = {
      firstName: "first_name",
      lastName: ["last_name", undefined, () => false],
    };
    const mapper = mappet(schema, { strictMode: true });
    const source = {
      first_name: "Michal",
    };
    expect(() => { mapper(source); }).not.toThrow();
  });

  it("sets custom mapper name for easier debugging", () => {
    const schema: Schema = {
      firstName: "first_name",
      lastName: "last_name",
    };
    const myMapper = mappet(schema, { strictMode: true, name: "myMapper" });
    const source = {
      first_name: "Michal",
    };
    expect(() => { myMapper(source); }).toThrowError("myMapper: last_name not found");
  });

  it("allows for modifing an entry with modifier", () => {
    const emptyStringToNull: Modifier = v => v === "" ? null : v;
    const upperCase: Modifier = v => v.toUpperCase();
    const schema: Schema = {
      firstName: ["first_name", upperCase],
      lastName: ["last_name", emptyStringToNull],
    };
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
    expect(actual).toEqual(expected);
  });

  it("allows for mapping depending on source", () => {
    interface MySource {
      country: string;
      date: string;
    }

    const formatDate: Modifier = (date: string, source: MySource) =>
      source.country === "us" ? moment(date).format("MM/DD/YY") : moment(date).format("DD/MM/YY");

    const schema: Schema = {
      country: "country",
      date: ["date", formatDate],
    };

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
    expect(actualUS).toEqual(expectedUS);

    const sourceGB = {
      country: "gb",
      date: "2016-07-30",
    };
    const actualGB = mapper(sourceGB);
    const expectedGB = {
      country: "gb",
      date: "30/07/16",
    };
    expect(actualGB).toEqual(expectedGB);
  });

  it("allows for filtering an entry with filter", () => {
    const skipNull: Filter = v => v === null ? false : true;
    const schema: Schema  = {
      firstName: ["first_name", undefined, skipNull],
      lastName: ["last_name", undefined, skipNull],
    };
    const mapper = mappet(schema);
    const source: Source = {
      first_name: "Michal",
      last_name: null,
    };
    const actual = mapper(source);
    const expected: Result = {
      firstName: "Michal",
    };
    expect(actual).toEqual(expected);
  });

  it("allows for filtering depending on source", () => {
    interface MySource {
      quantity: number;
      isGift: boolean;
      gift: { message: string, remind_before_renewing: boolean };
    }

    const skipIfNotAGift: Filter = (value: any, source: MySource) => source.isGift;

    const schema: Schema = {
      quantity: ["quantity"],
      gift: {
        message: ["giftMessage", undefined, skipIfNotAGift],
        remind_before_renewing: ["remindBeforeRenewingGift", undefined, skipIfNotAGift],
      },
    };

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
    };
    expect(actualNotGift).toEqual(expectedNotGift);

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
    expect(actualGift).toEqual(expectedGift);
  });

  it("allows for composing mappers", () => {
    const userSchema: Schema = {
      firstName: "first_name",
      lastName: "last_name",
    };
    const userMapper = mappet(userSchema);

    const usersSchema: Schema = {
      totalCount: "total_count",
      users: ["items", users => users.map(userMapper)],
    };
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
    expect(actual).toEqual(expected);
  });

  it("copy all existing properties in greedy mode", () => {
    const schema: Schema = {
      last_name: ["last_name", (str: string) => str.toUpperCase()],
    };
    const mapper = mappet(schema, { greedyMode: true });

    const source = {
      first_name: "Michal",
      last_name: "Zalecki",
      email: "example@michalzalecki.com",
    };
    const actual = mapper(source);
    const expected = {
      first_name: "Michal",
      last_name: "ZALECKI",
      email: "example@michalzalecki.com",
    };
    expect(actual).toEqual(expected);
  });
});
