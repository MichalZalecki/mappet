export interface IModifier {
    (value: any): any;
}
export interface IFilter {
    (dest: String, value: any, modifier: IModifier): boolean;
}
export declare type SourceEntry = [String, any, IModifier];
export declare type SchemaEntry = [String, String, IModifier];
export declare type Schema = Array<SchemaEntry>;
export default function mappet(schema: Schema, filter?: IFilter): Object;
