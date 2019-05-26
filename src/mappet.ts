import get = require("lodash/get");

type Source = {
  [key: string]: any,
};

type Result<T> = {
  [K in keyof T]: any
};

type Path = string;
type Modifier = (value: any, source: any) => any;
type Include = (value: any, source: any) => boolean;

export type SchemaEntry = Path | { path: Path, modifier?: Modifier, include?: Include };

type Schema = {
  [key: string]: SchemaEntry,
};

interface MappetOptions {
  /**
   * Set to `true` to enable strict mode
   *
   * ~~~
   * const mapper = mappet(schema, { strict: true });
   * ~~~
   */
  strict?: boolean;

  /**
   * Set to `true` to enable greedy mode
   *
   * ~~~
   * const mapper = mappet(schema, { greedy: true });
   * ~~~
   */
  greedy?: boolean;

  /**
   * Set custom mapper name used in error messages in strict for easier debugging.
   *
   * Defaults to `"Mappet"`.
   *
   * ~~~
   * const mapper = mappet(schema, { strict: true, name: "UserMapper" });
   * ~~~
   */
  name?: string;
}

function identity<T>(val: T) {
  return val;
}

function always(_val: any) {
  return true;
}

/**
 * Factory for creating mappers
 *
 * @param schema - Mapper schema
 * @param options - Mapper configuration
 * @returns Mapper function
 */
export default function mappet<
  S extends Schema,
  O extends MappetOptions,
>(schema: S, options: Partial<O> = {}) {
  const { strict, name = "Mappet", greedy } = options;
  return <T extends Source>(source: T) =>
    Object.keys(schema)
      .reduce((result, key) => {
        const schemaEntry = schema[key];
        const include = typeof schemaEntry === "string" ? always : schemaEntry.include || always;
        const path = typeof schemaEntry === "string" ? schemaEntry : schemaEntry.path;
        const value = get(source, path);

        if (!include(value, source)) {
          return result;
        }

        const modifier = typeof schemaEntry === "string" ? identity : schemaEntry.modifier || identity;

        if (strict && value === undefined) {
          throw new Error(`${name}: ${path} not found`);
        }

        return ({ ...result, [key]: modifier(value, source) });
      }, greedy ? { ...source } : {}) as Result<O extends { greedy: true } ? T & S : S>
}
