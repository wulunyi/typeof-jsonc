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
    expect(helper.topItem([1])).toBe(1);
  });

  it('isArrCreateNode', () => {
    expect(helper.isArrCreateNode(a => dtsDom.create.property('name', a))).toBe(
      true,
    );
    expect(helper.isArrCreateNode(dtsDom.create.interface('name'))).toBe(false);
  });

  it('isInterfaceNode', () => {
    expect(helper.isInterfaceNode(dtsDom.create.interface('name'))).toBe(true);
    expect(helper.isInterfaceNode(a => dtsDom.create.property('name', a))).toBe(
      false,
    );
  });
});
