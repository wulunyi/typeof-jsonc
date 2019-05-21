import * as dtsDom from 'dts-dom';

export enum TJSONC_TYPE {
    /** 对象 */
    OBJECT = 'Object',
    /** 数组 */
    ARRAY = 'Array',
    /** 基础 */
    NORMAL = 'Normal',
    /** 联合类型 */
    UNION = 'Union',
}

export interface BaseTJsonc {
    name: string;
    /**
     * 若父元素是数组则该数据表示数组中一共出现过的次数
     * 用于判断元素是否是可选元素
     */
    tagCount: number;
    comments: string[];
    parent?: ReferenceTJsonc;
}

export type TJsonc = ArrayTJsonc | ObjectTJsonc | NormalTJsonc | UnionTJsonc;

export type ArrayLikeTJsonc = ArrayTJsonc | UnionTJsonc;

export type ReferenceTJsonc = ArrayTJsonc | ObjectTJsonc | UnionTJsonc;

export interface ObjectTJsonc extends BaseTJsonc {
    type: TJSONC_TYPE.OBJECT;
    children: TJsonc[];
}

export interface ArrayTJsonc extends BaseTJsonc {
    type: TJSONC_TYPE.ARRAY;
    children: TJsonc[];
}

export interface UnionTJsonc extends BaseTJsonc {
    type: TJSONC_TYPE.UNION;
    children: TJsonc[];
}

export interface NormalTJsonc extends BaseTJsonc {
    type: TJSONC_TYPE.NORMAL;
    valueType: dtsDom.Type[];
}

export function objectTJsonc(name: string, parent?: ReferenceTJsonc): ObjectTJsonc {
    return {
        parent,
        name,
        children: [],
        type: TJSONC_TYPE.OBJECT,
        tagCount: 1,
        comments: [],
    };
}

export function normalTJsonc(name: string, type: dtsDom.Type, parent?: ReferenceTJsonc): NormalTJsonc {
    return {
        name,
        parent,
        type: TJSONC_TYPE.NORMAL,
        valueType: [type],
        tagCount: 1,
        comments: [],
    };
}

export function arrayTJsonc(name: string, parent?: ReferenceTJsonc): ArrayTJsonc {
    return {
        name,
        parent,
        type: TJSONC_TYPE.ARRAY,
        tagCount: 1,
        comments: [],
        children: [],
    };
}

export function unionTJsonc(name: string, parent?: ReferenceTJsonc): UnionTJsonc {
    return {
        name,
        parent,
        type: TJSONC_TYPE.UNION,
        tagCount: 1,
        comments: [],
        children: [],
    };
}

export function isArrayTJsonc(node?: TJsonc): node is ArrayTJsonc {
    return !!node && node.type === TJSONC_TYPE.ARRAY;
}

export function isUnionTJsonc(node?: TJsonc): node is UnionTJsonc {
    return !!node && node.type === TJSONC_TYPE.UNION;
}

export function isObjectTJsonc(node?: TJsonc): node is ObjectTJsonc {
    return !!node && node.type === TJSONC_TYPE.OBJECT;
}

export function isNormalTJsonc(node?: TJsonc): node is NormalTJsonc {
    return !!node && node.type === TJSONC_TYPE.NORMAL;
}

export function isArrayLikeTJsonc(node?: TJsonc): node is ArrayLikeTJsonc {
    return !!node && (node.type === TJSONC_TYPE.ARRAY || node.type === TJSONC_TYPE.UNION);
}