import * as dtsDom from 'dts-dom';
export default class ArrayType {
    kind: string;
    name: string;
    caseName: string;
    type: 'arrItem' | 'property';
    childrenType: Set<dtsDom.Type>;
    childrenIDec: Set<dtsDom.InterfaceDeclaration>;
    jsDocComments: string[];
    emit(): dtsDom.ArrayTypeReference | dtsDom.PropertyDeclaration;
}
