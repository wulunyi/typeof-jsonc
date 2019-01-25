import { mergeInterfaceDec, mergePropertyDec } from '../src/mergeDec';
import * as dtsDom from 'dts-dom';

describe('merge test', () => {
  it('mergePropertyDec', () => {
    const asP = dtsDom.create.property('A', dtsDom.type.string);
    const asPJSDoc = dtsDom.create.property('A', dtsDom.type.string);
    asPJSDoc.jsDocComment = 'test';
    const asPO = dtsDom.create.property(
      'A',
      dtsDom.type.string,
      dtsDom.DeclarationFlags.Optional,
    );
    const anP = dtsDom.create.property('A', dtsDom.type.number);
    const asnP = dtsDom.create.property(
      'A',
      dtsDom.create.union([dtsDom.type.string, dtsDom.type.number]),
    );

    expect(mergePropertyDec([asP, anP], 'A')).toEqual(asnP);
    expect(mergePropertyDec([asP, asP])).toEqual(asP);
    expect(mergePropertyDec([asP, asPO])).toEqual(asPO);
    expect(mergePropertyDec([asP, asPJSDoc])).toEqual(asPJSDoc);
    expect(mergePropertyDec([asP])).toEqual(asP);
    try {
      mergePropertyDec([], 'A');
    } catch (error) {
      expect(error.message).toEqual('dtsList not allow empty');
    }
  });

  it('mergeInterfaceDec', () => {
    const iA = dtsDom.create.interface('A');
    const iA1 = dtsDom.create.interface('A');
    const iA2 = dtsDom.create.interface('A');
    const p1 = dtsDom.create.property('B', dtsDom.type.string);
    iA2.members.push(p1);
    const iA3 = dtsDom.create.interface('A');
    iA3.members.push(
      dtsDom.create.property(
        'B',
        dtsDom.type.string,
        dtsDom.DeclarationFlags.Optional,
      ),
    );

    expect(mergeInterfaceDec([iA])).toEqual(iA);
    expect(mergeInterfaceDec([iA, iA1])).toEqual(iA);
    expect(mergeInterfaceDec([iA, iA2])).toEqual(iA3);
    try {
      mergeInterfaceDec([]);
    } catch (error) {
      expect(error.message).toEqual('dtsList not allow empty');
    }
  });
});