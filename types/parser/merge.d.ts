import * as t from './types';
export declare function uniq<T>(arr: T[]): T[];
export declare function mergeNormalTJsonc(nodes: t.NormalTJsonc[]): t.NormalTJsonc;
export declare function mergeObjectJTsonc(nodes: t.ObjectTJsonc[]): t.ObjectTJsonc;
export declare function mergeArrayLikeTJsonc<T extends t.ArrayLikeTJsonc>(nodes: T[]): T;
export declare function mergeArrayLikeTJsoncChildren<T extends t.ArrayLikeTJsonc>(node: T): T;
export declare function mergeObjectTJsoncChildren(node: t.ObjectTJsonc): t.ObjectTJsonc;
