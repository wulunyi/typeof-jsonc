import * as dtsDom from 'dts-dom';
import * as helper from '../src/helper';

describe('helper', () => {
  it('add', () => {
    expect(helper.add(1, 2, 3)).toBe(6);
  });

  it('isEmpty', () => {
    expect(helper.isEmpty([])).toBe(true);
    expect(helper.isEmpty([''])).toBe(false);
  });

  it('topItem', () => {
    expect(helper.topTypeNode([1])).toBe(1);
  });

  it('isArrCreateNode', () => {
    expect(helper.isArrayTypeNode(dtsDom.create.interface('name'))).toBe(false);
  });

  it('isInterfaceNode', () => {
    expect(helper.isInterfaceTypeNode(dtsDom.create.interface('name'))).toBe(
      true,
    );
  });
});
