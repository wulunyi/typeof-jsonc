import * as t from '../parser/types';
import * as dtsDom from 'dts-dom';
import { RenderOptions } from './types';
declare type HolderDts = '';
export declare function isPropertyDeclaration(dts: dtsDom.ObjectTypeMember): dts is dtsDom.PropertyDeclaration;
export declare function isHolderDts(dts: any): dts is HolderDts;
/**
 * 合并两棵 interface 树
 * @param aDts
 * @param bDts
 */
export declare function mergeInterfaceDeclaration(aDts: dtsDom.InterfaceDeclaration, bDts: dtsDom.InterfaceDeclaration): dtsDom.InterfaceDeclaration;
export declare function render(root: t.ObjectTJsonc, options?: Partial<RenderOptions>): string;
export {};
