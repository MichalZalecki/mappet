/**
 * Modifier function interface to optionaly change mapped value
 *
 * @param value - Value to be changed
 */
export interface Modifier {
    (value: any): any;
}
/**
 * Filter function interface to make it possible to omit certain entries
 *
 * @param dest - Path to destination entry
 * @param value - Value from source object
 * @param modifier - Modifier function
 */
export interface Filter {
    (dest: string, value: any, modifier: Modifier): boolean;
}
/**
 * Mapper function interface that accepts object and returns mapped
 * object based on schema passed to mappet
 *
 * @param source - Source object to be mapped
 * @returns Mapped object
 */
export interface Mapper {
    (source: Object): Object;
}
export declare type SourceEntry = [string, any, Modifier];
export declare type SchemaEntry = [string, string, Modifier];
export declare type Schema = Array<SchemaEntry>;
/**
 * Factory for creating mappers functions
 *
 * @param schema - Mapper schema
 * @param filter - Determine whether entry should be keept or omitted
 * @returns Mapper function
 */
export default function mappet(schema: Schema, filter?: Filter): Mapper;
