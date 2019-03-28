import * as dtsDom from 'dts-dom';
export default class ArrayType {
    kind: string;
    name: string;
    caseName: string;
    type: 'arrItem' | 'property';
    typeMembers: Set<dtsDom.Type>;
    typeNodeMembers: Set<dtsDom.InterfaceDeclaration>;
    jsDocComment: string[];
    emit(): dtsDom.ArrayTypeReference | dtsDom.PropertyDeclaration;
}
