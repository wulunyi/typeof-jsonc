import { TypeNode, CanAddCommentNode } from './types';
import * as dtsDom from 'dts-dom';
import ArrayType from './arrayType';

export function isEmpty<T>(typeNodeStack: T[]): typeNodeStack is [] {
    return typeNodeStack.length === 0;
}

export function topTypeNode<T>(typeNodeStack: T[]): T {
    return typeNodeStack.slice(-1)[0]!;
}

export function isArrayTypeNode(
    node: TypeNode | CanAddCommentNode,
): node is ArrayType {
    return !!node && node.kind === 'arrayType';
}

export function isInterfaceTypeNode(
    node: TypeNode | CanAddCommentNode,
): node is dtsDom.InterfaceDeclaration {
    return !!node && node.kind === 'interface';
}

export function topIsArrayTypeNode(arr: TypeNode[]): arr is ArrayType[] {
    if (arr.length === 0) return false;

    return isArrayTypeNode(topTypeNode(arr));
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
