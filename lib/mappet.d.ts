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
     * const mapper = mappet(schema, { strictMode: true });
     * ~~~
     */
    strictMode?: boolean;
    /**
     * Set custom mapper name used in error messages in strictMode for easier debugging.
     *
     * Defaults to `"Mappet"`.
     *
     * ~~~
     * const mapper = mappet(schema, { strictMode: true, name: "UserMapper" });
     * ~~~
     */
    name?: string;
}
export declare type BasicSchemaEntry = [string, string];
export declare type ModifiableSchemaEntry = [string, string, Modifier];
export declare type FilterableSchemaEntry = [string, string, Modifier, Filter];
export declare type WithValueSchemaEntry = [string, string, Modifier, Filter, any];
export declare type Schema = [BasicSchemaEntry | ModifiableSchemaEntry | FilterableSchemaEntry];
/**
 * Factory for creating mappers functions
 *
 * @param schema - Mapper schema
 * @param options - Mapper configuration
 * @returns Mapper function
 */
export default function mappet(schema: Schema, options?: MappetOptions): Mapper;
