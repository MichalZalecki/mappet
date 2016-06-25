import { get, set } from "lodash";

/**
 * Modifier function interface to optionaly change mapped value
 *
 * @param value - Value to be changed
 */
export interface IModifier {
  (value: any): any;
}

/**
 * Filter function interface to make it possible to omit certain entries
 *
 * @param dest - Path to destination entry
 * @param value - Value from source object
 * @param modifier - Modifier function
 */
export interface IFilter {
  (dest: String, value: any, modifier: IModifier): boolean;
}

/**
 * Mapper function interface that accepts object and returns mapped
 * object based on schema passed to mappet
 *
 * @param source - Source object to be mapped
 * @returns Mapped object
 */
export interface IMapper {
  (source: Object): Object;
}

export type SourceEntry = [String, any, IModifier];
export type SchemaEntry = [String, String, IModifier];
export type Schema = Array<SchemaEntry>;

/**
 * Always return passed value
 *
 * @param value - Value which will be returned
 */
function always<T>(value: T): T {
  return value;
}

/**
 * Default filter function which accepts each entry
 */
function accept(...args: Array<any>): boolean {
  return true;
}

/**
 * Factory for creating mappers functions
 *
 * @param schema - Mapper schema
 * @param filter - Determine whether entry should be keept or omitted
 * @returns Mapper function
 */
export default function mappet(schema: Schema, filter: IFilter = accept): IMapper {
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
