import * as dtsDom from 'dts-dom';
import ArrayType from './arrayType';
import { ParseOptions } from 'jsonc-parser';
export declare type TypeNode = dtsDom.InterfaceDeclaration | ArrayType;
export declare type CanAddCommentNode = dtsDom.PropertyDeclaration | dtsDom.InterfaceDeclaration | ArrayType;
export interface IPropertyObjDec {
    property: dtsDom.PropertyDeclaration | null;
    interface: dtsDom.InterfaceDeclaration;
}
export interface IParseOptions extends ParseOptions {
    /** 前缀 */
    prefix: string;
    /** 自定义名字规范 */
    onName: (name: string) => string;
    /** 添加 export 导出 */
    addExport: boolean;
}
