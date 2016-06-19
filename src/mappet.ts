export interface IMapper {
  (object: any): any;
}

import { get, set } from "lodash";

export function always<T>(value: T): T {
  return value;
}

export function accept(value?: any): boolean {
  return true;
}

export default function mappet(schema: Array<any>, filter: any = accept): IMapper {
  return object => {
    return schema
      .map(([dest, source, modifier = always]) => [dest, get(object, source), modifier])
      .filter((args: Array<any>) => filter(...args))
      .reduce((akk, [dest, value, modifier]) => set(akk, dest, modifier(value)), {});
  };
}
