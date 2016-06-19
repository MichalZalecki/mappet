export interface IMapper {
    (object: any): any;
}
export declare function always<T>(value: T): T;
export declare function accept(value?: any): boolean;
export default function mappet(schema: Array<any>, filter?: any): IMapper;
