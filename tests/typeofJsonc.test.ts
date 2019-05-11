import typeofJsonc from '../src/index';

describe('Test typeofJsonc', () => {
    it('typeofJsonc json', () => {
        expect(
            typeofJsonc('{ "name": "wly" }', 'IName')
                .trim()
                .replace(/(\n|\r)/g, ''),
        ).toEqual('declare interface IName {    name: string;}');
    });

    it('typeofJsonc not standard json', () => {
        expect(
            typeofJsonc("{ name: 'wly' }", 'IName')
                .trim()
                .replace(/(\n|\r)/g, ''),
        ).toEqual('declare interface IName {    name: string;}');
    });

    it('typeofJsonc json has array', () => {
        expect(
            typeofJsonc("{ name: ['wly'] }", 'IName')
                .trim()
                .replace(/(\n|\r)/g, ''),
        ).toEqual('declare interface IName {    name: string[];}');
    });

    it('typeofJsonc jsonc', () => {
        expect(
            typeofJsonc("{ \n//name \n name: ['wly'] }", 'IName', {
                disallowComments: false,
                singleLineJsDocComments: true,
            })
                .trim()
                .replace(/(\n|\r)/g, ''),
        ).toEqual(
            'declare interface IName {    /**  name  */    name: string[];}',
        );
    });
});
