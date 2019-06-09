import mappet from "./mappet";
import moment from "moment";

describe("mappet", () => {
  it("performs simple mapping based on the schema", () => {
    const schema = {
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
    const simpleSchema = {
      firstName: "first_name",
      lastName: "last_name",
    };
    const mapper = mappet(simpleSchema);
    const source = {
      first_name: "Michal",
    };
    const actual = mapper(source);
    const expected = {
      firstName: "Michal",
      lastName: undefined,
    };
    expect(actual).toEqual(expected);
  });

  it("allows for omitting an entry with include", () => {
    const notNull = (v: any) => v !== null;
    const schema = {
      firstName: { path: "first_name", include: notNull },
      lastName: { path: "last_name", include: notNull },
    };
    const mapper = mappet(schema);
    const source = {
      first_name: "Michal",
      last_name: null,
    };
    const actual = mapper(source);
    const expected = {
      firstName: "Michal",
    };
    expect(actual).toEqual(expected);
  });

  it("throws on not found in strict mode", () => {
    const schema = {
      firstName: "first_name",
      lastName: "last_name",
    };
    const mapper = mappet(schema, { strict: true });
    const source = {
      first_name: "Michal",
    };
    expect(() => { mapper(source); }).toThrowError("Mappet: last_name not found");
  });

  it("does not throw when entry should be skipped", () => {
    const schema = {
      firstName: "first_name",
      lastName: { path: "last_name", include: () => false },
    };
    const mapper = mappet(schema, { strict: true });
    const source = {
      first_name: "Michal",
    };
    expect(() => { mapper(source); }).not.toThrow();
  });

  it("sets custom mapper name for easier debugging", () => {
    const schema = {
      firstName: "first_name",
      lastName: "last_name",
    };
    const myMapper = mappet(schema, { strict: true, name: "myMapper" });
    const source = {
      first_name: "Michal",
    };
    expect(() => { myMapper(source); }).toThrowError("myMapper: last_name not found");
  });

  it("allows for modifing an entry with modifier", () => {
    const emptyStringToNull = (v: string) => v === "" ? null : v;
    const upperCase = (v: string) => v.toUpperCase();
    const schema = {
      firstName: { path: "first_name", modifier: upperCase },
      lastName: { path: "last_name", modifier: emptyStringToNull },
    };
    const mapper = mappet(schema);
    const source = {
      first_name: "Michal",
      last_name: "",
    };
    const actual = mapper(source);
    const expected = {
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

    const formatDate = (date: string, source: MySource) =>
      source.country === "us" ? moment(date).format("MM/DD/YY") : moment(date).format("DD/MM/YY");

    const schema = {
      country: "country",
      date: { path: "date", modifier: formatDate },
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

  it("allows for composing mappers", () => {
    const userSchema = {
      firstName: "first_name",
      lastName: "last_name",
    };
    const userMapper = mappet(userSchema);

    interface User {
      firstName: string;
      lastName: string;
    }

    const usersSchema = {
      totalCount: "total_count",
      users: { path: "items", modifier: (users: User[]) => users.map(userMapper) },
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
    const schema = {
      last_name: { path: "last_name", modifier: (str: string) => str.toUpperCase() },
    };
    const mapper = mappet(schema, { greedy: true });

    const source = {
      first_name: "Michal",
      last_name: "Zalecki",
      email: "example@michalzalecki.com",
    };
    const actual = mapper(source);
    expect(actual.first_name).toEqual("Michal");
    expect(actual.last_name).toEqual("ZALECKI");
    expect(actual.email).toEqual("example@michalzalecki.com");
  });

  it("behaves like lodash's get in regard to dots in property names", () => {
    const schema = {
      ab: "a.b",
      cde: "c.d.e",
      cxz: "c.y.z",
    };
    const mapper = mappet(schema);

    const source = {
      "a.b": 1,
      "a": {
        b: 2,
      },
      "c": {
        "d": {
          e: 3,
        },
        /**
         * https://github.com/lodash/lodash/issues/1637#issuecomment-156258271
         *
         * To support this case it will be required to change and support `type Path = string | string[]`
         * Example `cxz: { path: ["c", "y.z"], modifier: (f:any) => f },` and/or make `modifier` optional.
         */
        "d.e": 4,
        "y.z": "You cannot get this and 'd.e'",
      },
    };
    const actual = mapper(source);
    expect(actual.ab).toEqual(1);
    expect(actual.cde).toEqual(3);
    expect(actual.cxz).toBeUndefined();
  });
});
