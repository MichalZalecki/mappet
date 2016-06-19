import { get, set } from "lodash";

export interface IModifier {
  (value: any): any;
}

export interface IFilter {
  (dest: String, value: any, modifier: IModifier): boolean;
}

export type SourceEntry = [String, any, IModifier];
export type SchemaEntry = [String, String, IModifier];
export type Schema = Array<SchemaEntry>;

function always<T>(value: T): T {
  return value;
}

function accept(...args: Array<any>): boolean {
  return true;
}

export default function mappet(schema: Schema, filter: IFilter = accept): Object {
  return (object: Object) => {
    return schema
      .map(([dest, source, modifier = always]) => [dest, get(object, source), modifier])
      .filter((args: SourceEntry) => filter.apply(this, args))
      .reduce((akk: Object, entry: SourceEntry) => {
        const [dest, value, modifier] = entry;
        return set(akk, dest, modifier(value));
      }, {});
  };
}
