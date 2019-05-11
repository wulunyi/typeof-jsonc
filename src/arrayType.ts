import * as dtsDom from 'dts-dom';
import { genArrType } from './helper';

export default class ArrayType {
    public kind = 'arrayType';
    public name: string = '';
    public caseName: string = '';
    public type: 'arrItem' | 'property' = 'arrItem';
    public typeMembers = new Set<dtsDom.Type>();
    public typeNodeMembers = new Set<dtsDom.InterfaceDeclaration>();
    public jsDocComment: string[] = [];

    public emit() {
        const ctype = genArrType([...this.typeMembers]);

        if (this.type === 'arrItem') {
            return dtsDom.create.array(ctype);
        }

        const resultType = dtsDom.create.property(
            this.name,
            dtsDom.create.array(ctype),
        );

        if (this.jsDocComment.length > 0) {
            resultType.jsDocComment = this.jsDocComment.join('\n');
        }

        return resultType;
    }
}
