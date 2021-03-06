import * as cParser from '../src/parser/commentsParser';

describe('test comment parser', () => {
    it('getCommentKind', () => {
        expect(cParser.getCommentKind('// kind')).toEqual(cParser.CommentKind.Trailing);

        expect(cParser.getCommentKind('\n // kind aaa')).toEqual(cParser.CommentKind.Leading);

        expect(cParser.getCommentKind('/** hello */')).toEqual(cParser.CommentKind.JsDoc);

        expect(cParser.getCommentKind('hello')).toEqual(cParser.CommentKind.Other);
    });

    it('getLeadingComment', () => {
        expect(cParser.getLeadingComment(' \n // hello world')).toEqual(['hello world']);
    });

    it('getTrailingComment', () => {
        expect(cParser.getTrailingComment('// hello world')).toEqual(['hello world']);
    });

    it('getJsDoc', () => {
        expect(cParser.getJsDoc('/**\n* hello \n* world*/')).toEqual(['hello', 'world']);

        expect(
            cParser.getJsDoc(`/*

    **一段简单的 JSDoc 注释。

    */`),
        ).toEqual(['一段简单的 JSDoc 注释。']);

        expect(cParser.getJsDoc('/** This is a description of the foo function. */')).toEqual([
            'This is a description of the foo function.',
        ]);
    });

    it('parser', () => {
        expect(cParser.parser('// hello')).toEqual({
            kind: cParser.CommentKind.Trailing,
            content: ['hello'],
        });

        expect(cParser.parser('hello')).toEqual({
            kind: cParser.CommentKind.Other,
            content: [],
        });
    });
});
