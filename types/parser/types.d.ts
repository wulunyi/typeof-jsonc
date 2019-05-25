import * as dtsDom from 'dts-dom';
export declare enum TJSONC_TYPE {
    /** 对象 */
    OBJECT = "Object",
    /** 数组 */
    ARRAY = "Array",
    /** 基础 */
    NORMAL = "Normal",
    /** 联合类型 */
    UNION = "Union"
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
export declare type TJsonc = ArrayTJsonc | ObjectTJsonc | NormalTJsonc | UnionTJsonc;
export declare type ArrayLikeTJsonc = ArrayTJsonc | UnionTJsonc;
export declare type ReferenceTJsonc = ArrayTJsonc | ObjectTJsonc | UnionTJsonc;
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
export declare function objectTJsonc(name: string, parent?: ReferenceTJsonc): ObjectTJsonc;
export declare function normalTJsonc(name: string, type: dtsDom.Type, parent?: ReferenceTJsonc): NormalTJsonc;
export declare function arrayTJsonc(name: string, parent?: ReferenceTJsonc): ArrayTJsonc;
export declare function unionTJsonc(name: string, parent?: ReferenceTJsonc): UnionTJsonc;
export declare function isArrayTJsonc(node?: TJsonc): node is ArrayTJsonc;
export declare function isUnionTJsonc(node?: TJsonc): node is UnionTJsonc;
export declare function isObjectTJsonc(node?: TJsonc): node is ObjectTJsonc;
export declare function isNormalTJsonc(node?: TJsonc): node is NormalTJsonc;
export declare function isArrayLikeTJsonc(node?: TJsonc): node is ArrayLikeTJsonc;
/**
 * 判断是否相同结构，但要求只允许 root name 不同
 * @param aNode
 * @param bNode
 * @param sameName
 */
export declare function isSameStructTJsonc(aNode: TJsonc | undefined, bNode: TJsonc | undefined, sameName?: boolean): boolean;
export declare function isSameStructObjectTJsonc(aNode: ObjectTJsonc, bNode: ObjectTJsonc, sameName?: boolean): boolean;
export declare function isSameStructNormalTJsonc(aNode: NormalTJsonc, bNode: NormalTJsonc, sameName?: boolean): boolean;
export declare function isSameStructArrayLikeTJsonc<T extends ArrayTJsonc | UnionTJsonc>(aNode: T, bNode: T, sameName?: boolean): boolean;
