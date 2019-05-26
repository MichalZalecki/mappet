import get from "lodash/get";

function identity<T>(v: T): T {
  return v;
}

interface ComplexSchemaEntry<T> {
  path: string;
  modifier: (v: any) => T;
}

type SchemaEntry<T> = string | ComplexSchemaEntry<T>;

function isComplexSchemaEntry(entry: any): entry is ComplexSchemaEntry<any> {
  return typeof entry !== "string";
}

interface Schema {
  [key: string]: SchemaEntry<any>;
}

type Result<SCH extends Schema> = {
  [K in keyof SCH]: SCH[K] extends ComplexSchemaEntry<any> ? ReturnType<SCH[K]["modifier"]> : any;
};

function keys<T>(obj: T) {
  return Object.keys(obj) as Array<keyof T>;
}

function mappet<S extends Schema>(schema: S) {
  return (source: {}): Result<S> => {
    return keys(schema).reduce<Result<S>>((result, key) => {
      const entry = schema[key] as SchemaEntry<any>;
      const value = isComplexSchemaEntry(entry) ? get(entry, entry.path) : get(entry, entry);
      const modifier = isComplexSchemaEntry(entry) ? entry.modifier : identity;
      return ({ ...result, [key]: modifier(value) });
    }, {} as any);
  };
}

const mySource = {
  person: {
    first_name: "Michał",
    last_name: "Zalecki",
  },
};

const mySchema = {
  firstName: "person.first_name",
  lastName: { path: "person.last_name", modifier: (value: string) => value.toUpperCase() },
  age: { path: "person.age", modifier: () => 20 },
};

const r = mappet(mySchema)(mySource);

console.log(r.firstName); // any
console.log(r.lastName);  // string
console.log(r.age);       // number
