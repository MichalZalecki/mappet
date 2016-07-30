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
export declare type BasicSchemaEntry = [string, string];
export declare type ModifiableSchemaEntry = [string, string, Modifier];
export declare type FilterableSchemaEntry = [string, string, Modifier, Filter];
export declare type Schema = [BasicSchemaEntry | ModifiableSchemaEntry | FilterableSchemaEntry];
/**
 * Factory for creating mappers functions
 *
 * @param schema - Mapper schema
 * @param filter - Determine whether entry should be keept or omitted
 * @returns Mapper function
 */
export default function mappet(schema: Schema, strictMode?: boolean): Mapper;
