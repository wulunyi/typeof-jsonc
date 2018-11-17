import * as dtsDom from 'dts-dom';
import ArrayType from './arrayType';

export type StackNode = dtsDom.InterfaceDeclaration | ArrayType;

export type CanAddCommentNode =
  | dtsDom.PropertyDeclaration
  | dtsDom.InterfaceDeclaration;

// 属性对象声明
export interface IPropertyObjDec {
  property: dtsDom.PropertyDeclaration | null;
  interface: dtsDom.InterfaceDeclaration;
}
