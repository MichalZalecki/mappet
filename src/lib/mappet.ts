import * as get from "lodash/get";
import * as set from "lodash/set";

/**
 * Source interface for defining mapper input object
 */
export interface Source {
  [key: string]: any;
}

/**
 * Result interface for defining mapper output object
 */
export interface Result {
  [key: string]: any;
}

/**
 * Modifier function interface to change mapped value
 *
 * @param value - Value from source object
 * @param source - Source
 */
export interface Modifier {
  (value: any, source: Source): any;
}

/**
 * Filter function interface to make it possible to omit entry
 *
 * @param value - Value from source object
 * @param source - Source
 */
export interface Filter {
  (value: any, source: Source): boolean;
}

/**
 * Mapper function interface that accepts Source object and returns Result object
 * by transformations according to Schema passed to mappet
 *
 * @param source - Source object to be mapped
 * @returns Result
 */
export interface Mapper {
  (source: Source): Result;
}

/**
 * Options for modifying behaviour of the mapper
 */
export interface MappetOptions {
  /**
   * Set to `true` to enable strict mode
   *
   * ~~~
   * const mapper = mappet(schema, { strictMode: true })
   * ~~~
   */
  strictMode?: boolean;
}

export type BasicSchemaEntry = [string, string];
export type ModifiableSchemaEntry = [string, string, Modifier];
export type FilterableSchemaEntry = [string, string, Modifier, Filter];

/*
 * Schema type for defining schema for mappet
 */
export type Schema = [BasicSchemaEntry | ModifiableSchemaEntry | FilterableSchemaEntry];

/**
 * Default modifier function which returns passed value without any modifications
 *
 * @param value - Value which will be returned
 */
function identity<T>(value: T): T {
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
 * @param options - Mapper configuration
 * @returns Mapper function
 */
export default function mappet(schema: Schema, options: MappetOptions = { strictMode: false }): Mapper {
  const { strictMode } = options;
  return (source: Source) => {
    return schema
      .map(([destPath, sourcePath, modifier = identity, filter = accept]: FilterableSchemaEntry) => {
        const value = get(source, sourcePath);
        if (strictMode && value === undefined) {
          throw `Mappet: ${sourcePath} not found`;
        }
        return [destPath, value, modifier, filter];
      })
      .filter(([_destPath, value, _modifier, filter]: [string, any, Modifier, Filter]) => filter(value, source))
      .map(([destPath, value, modifier]: [string, any, Modifier]) => [destPath, modifier(value, source)])
      .reduce((akk: Result, [destPath, value]: [string, any]) => set(akk, destPath, value), {});
  };
}
