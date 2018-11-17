import * as dtsDom from 'dts-dom';
import { genArrType } from './helper';

export default class ArrayType {
  public kind = 'arrayType';
  public name: string = '';
  public caseName: string = '';
  public type: 'arrItem' | 'property' = 'arrItem';
  public childrenType = new Set<dtsDom.Type>();
  public childrenIDec = new Set<dtsDom.InterfaceDeclaration>();
  public jsDocComments: string[] = [];

  public emit() {
    const ctype = genArrType([...this.childrenType]);

    if (this.type === 'arrItem') {
      return dtsDom.create.array(ctype);
    }

    const resultType = dtsDom.create.property(
      this.name,
      dtsDom.create.array(ctype),
    );

    if (this.jsDocComments.length > 0) {
      resultType.jsDocComment = this.jsDocComments.join('\n');
    }

    return resultType;
  }
}
