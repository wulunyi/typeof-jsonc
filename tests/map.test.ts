import MapSet from '../src/mapSet';

describe('map', () => {
  it('add', () => {
    const stringMap = new MapSet<string>();
    stringMap.add('aa', 'bb');
    stringMap.add('aa', 'bb');

    expect(stringMap.get('aa')).toEqual(['bb']);
  });

  it('get', () => {
    expect(new MapSet().get('aa')).toEqual([]);
  });
});
