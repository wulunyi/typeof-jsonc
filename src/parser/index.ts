import { ParseOptions } from 'jsonc-parser';
import * as dtsDom from 'dts-dom';
import * as t from './types';
import * as jsoncComment from './commentsParser';
import { merge } from './merge';
import { traverse } from './jsoncTraverse';
import { topItem } from '../utils/index';

const defaultParseOptions = () => ({ disallowComments: true, allowTrailingComma: true });

export function parser(jsonc: string, name: string, options: ParseOptions = defaultParseOptions()): t.ObjectTJsonc {
    let result!: t.ObjectTJsonc;

    const tJsoncStack: t.ReferenceTJsonc[] = [];
    const stepsTJsoncStack: t.TJsonc[] = [];
    const commentStack: string[] = [];

    function popTjsoncAndPushPopUpTjsonc() {
        const popTJsonc = tJsoncStack.pop();

        if (popTJsonc) {
            stepsTJsoncStack.push(popTJsonc);
        }
    }

    function safePushTopJSoncChildren(node: t.TJsonc) {
        const topTJsonc = topItem(tJsoncStack);

        if (topTJsonc) topTJsonc.children.push(node);
    }

    traverse(
        {
            name,
            jsonc,
            options,
        },
        {
            onObjectBegin(objectName: string) {
                const node = t.objectTJsonc(objectName, topItem(tJsoncStack));

                node.comments = commentStack.splice(0);

                if (result === undefined) {
                    result = node;
                }

                safePushTopJSoncChildren(node);

                tJsoncStack.push(node);
                stepsTJsoncStack.push(node);
            },
            onObjectEnd() {
                popTjsoncAndPushPopUpTjsonc();
            },

            onArrayBegin(arrName: string) {
                const node = t.arrayTJsonc(arrName, topItem(tJsoncStack));

                node.comments = commentStack.splice(0);

                safePushTopJSoncChildren(node);

                tJsoncStack.push(node);
                stepsTJsoncStack.push(node);
            },
            onArrayEnd() {
                popTjsoncAndPushPopUpTjsonc();
            },
            onLiteralValue(propertyNoname: string, value: any) {
                const node = t.normalTJsonc(propertyNoname, typeof value as dtsDom.Type, topItem(tJsoncStack));

                node.comments = commentStack.splice(0);

                safePushTopJSoncChildren(node);

                stepsTJsoncStack.push(node);
            },
            onComment(comment: jsoncComment.Comment) {
                if (comment.kind === jsoncComment.CommentKind.Trailing) {
                    const topNode = topItem(stepsTJsoncStack);

                    if (topNode) {
                        // 将开始注释放到给第一个元素
                        // if (topNode.type !== t.TJSONC_TYPE.NORMAL && topNode.children.length === 0) {
                        //     commentStack.push(...comment.content);
                        // } else {
                        topNode.comments.push(...comment.content);
                        // }
                    } else {
                        commentStack.push(...comment.content);
                    }
                } else {
                    commentStack.push(...comment.content);
                }
            },
        },
    );

    return merge(result);
}
