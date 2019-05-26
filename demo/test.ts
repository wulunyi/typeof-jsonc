/**  program  */
export interface IResponse {
    /**  aaa  */
    barr: string[];
    /**  this is name  */
    name: string;
    /**
     * this is demo
     * demo
     * this.test
     */
    demo: Idemo;
    /**  this is arr  */
    arr: Array<number | Iarr>;
    /**
     * Demonstrate how to modify the source code before the parser sees it.
     * @module plugins/commentConvert
     */
    a: string;
    b: string[];
    aaaList: IaaaItem[];
    list: IItem[];
    /**
     * 123
     * a: 123
     */
    testList: ItestItem[];
    sameStruct: IsameStruct;
    sameBStruce: IsameBStruce;
}

type IsameBStruce = IsameStruct;

export interface IsameStruct {
    /**
     * hello
     * world
     */
    name: string;
}

type ItestItem = IItem;

export interface IItem {
    bbList: IbbItem[];
}

export interface IItem {
    bbList: IbbItem[];
}

export interface IaaaItem {
    enen: string;
    aaa?: string;
    bbList: IbbItem[];
    bb?: string;
}

export interface Iarr {
    age: number;
}

/**
 * this is demo
 * demo
 * this.test
 */
export interface Idemo {
    hello: string;
}
