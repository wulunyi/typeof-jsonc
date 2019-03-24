import * as dtsDom from 'dts-dom';
export declare function mergeInterfaceTypeNodes(interfaceTypeNodes: dtsDom.InterfaceDeclaration[], name?: string): dtsDom.InterfaceDeclaration;
/**
 * merge same name PropertyDeclaration
 * @param propertyTypeNodes PropertyDeclaration[]
 */
export declare function mergePropertyTypeNodes(propertyTypeNodes: dtsDom.PropertyDeclaration[], name?: string): dtsDom.PropertyDeclaration;
