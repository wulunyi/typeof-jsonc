import * as dtsDom from 'dts-dom';

export type HalfCreateTypeFn = (
  type: dtsDom.Type,
) => dtsDom.PropertyDeclaration | dtsDom.ArrayTypeReference;

export type StackNode = dtsDom.InterfaceDeclaration | HalfCreateTypeFn;

export type CanAddCommentNode =
  | dtsDom.PropertyDeclaration
  | dtsDom.InterfaceDeclaration;
