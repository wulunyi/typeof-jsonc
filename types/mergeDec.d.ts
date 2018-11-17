import * as dtsDom from 'dts-dom';
export declare function mergeInterfaceDec(dtsList: dtsDom.InterfaceDeclaration[], name?: string): dtsDom.InterfaceDeclaration;
/**
 * merge same name PropertyDeclaration
 * @param dtsList PropertyDeclaration[]
 */
export declare function mergePropertyDec(dtsList: dtsDom.PropertyDeclaration[], name?: string): dtsDom.PropertyDeclaration;
