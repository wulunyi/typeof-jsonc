import { StackNode } from './types';

export function isEmpty(dts: any[]): boolean {
  return !dts.length;
}

export function topItem<T>(dts: T[]): T {
  return dts.slice(-1)[0]!;
}

export function isArrCreateNode(node: StackNode): boolean {
  return typeof node === 'function';
}

export function isInterfaceNode(node: StackNode): boolean {
  return typeof node !== 'function' && node.kind === 'interface';
}

export function whetherTopIsArr(arr: StackNode[]): boolean {
  if (arr.length === 0) return false;

  return isArrCreateNode(topItem(arr));
}

export function add(...params: number[]): number {
  return params.reduce((total, cur) => {
    return total + cur;
  }, 0);
}
