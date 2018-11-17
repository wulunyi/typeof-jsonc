import { StackNode } from './types';
import * as dtsDom from 'dts-dom';
import ArrayType from './arrayType';

export function isEmpty(dts: any[]) {
  return dts.length === 0;
}

export function topItem<T>(dts: T[]): T {
  return dts.slice(-1)[0]!;
}

export function isArrCreateNode(node: StackNode): node is ArrayType {
  return node.kind === 'arrayType';
}

export function isInterfaceNode(
  node: StackNode,
): node is dtsDom.InterfaceDeclaration {
  return node.kind === 'interface';
}

export function whetherTopIsArr(arr: StackNode[]): arr is ArrayType[] {
  if (arr.length === 0) return false;

  return isArrCreateNode(topItem(arr));
}

export function add(...params: number[]): number {
  return params.reduce((total, cur) => {
    return total + cur;
  }, 0);
}

export function genArrType(typeList: dtsDom.Type[]): dtsDom.Type {
  if (typeList.length === 0) return dtsDom.type.any;
  if (typeList.length === 1) return typeList[0];

  return dtsDom.create.union(typeList);
}
