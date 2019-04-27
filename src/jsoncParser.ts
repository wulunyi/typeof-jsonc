import * as dtsDom from 'dts-dom';
import { visit, ParseErrorCode } from 'jsonc-parser';
import * as helper from './helper';
import * as jsoncComment from './commentsParser';
import { TypeNode, CanAddCommentNode, IParseOptions } from './types';
import { mergeInterfaceTypeNodes } from './mergeDec';
import SingleName from './singleName';
import ArrayType from './arrayType';

export default function parser(
    jsonc: string,
    name: string,
    options: IParseOptions,
): dtsDom.TopLevelDeclaration[] {
    const result: dtsDom.TopLevelDeclaration[] = [];

    // 辅助变量
    // preOffset 用来处理注释获取（onComment 获取不到换行数据）
    let preOffset: number = 0;
    const nameStack: string[] = [name];
    const typeNodeStack: TypeNode[] = [];
    const comments: string[] = [];
    // 生成唯一名字的工厂对象
    const singleTypeName = new SingleName();

    // 计算当前处理的前置 offset 为注释做铺垫
    function walkOffset(...params: number[]) {
        preOffset = helper.add(...params);
    }

    function popAllComments() {
        return comments.splice(0, comments.length);
    }

    function addComment<T extends CanAddCommentNode>(node: T): T {
        if (!helper.isEmpty(comments)) {
            if (helper.isArrayTypeNode(node)) {
                node.jsDocComment.push(...popAllComments());
            } else {
                node.jsDocComment = [node.jsDocComment || '']
                    .concat(popAllComments())
                    .filter(coment => !!coment)
                    .join('\n');
            }
        }

        return node;
    }

    function visitTopTypeNode(handler: {
        onGenArrTypeNode: (dts: ArrayType) => void;
        onInterfaceTypeNode: (dts: dtsDom.InterfaceDeclaration) => void;
    }) {
        if (!helper.isEmpty(typeNodeStack)) {
            const topStackTypeNode = helper.topTypeNode(typeNodeStack);

            if (helper.isArrayTypeNode(topStackTypeNode)) {
                handler.onGenArrTypeNode(topStackTypeNode);
            } else if (helper.isInterfaceTypeNode(topStackTypeNode)) {
                handler.onInterfaceTypeNode(topStackTypeNode);
            }
        }
    }

    function getName(): string {
        if (!helper.isEmpty(typeNodeStack)) {
            const topStackTypeNode = helper.topTypeNode(typeNodeStack);

            if (helper.isArrayTypeNode(topStackTypeNode)) {
                return topStackTypeNode.name;
            }

            return nameStack.pop()!;
        }

        return nameStack.pop()!;
    }

    function getCaseName(pName: string): string {
        if (!helper.isEmpty(typeNodeStack)) {
            const topStackTypeNode = helper.topTypeNode(typeNodeStack);

            if (helper.isArrayTypeNode(topStackTypeNode)) {
                return options.onName(topStackTypeNode.caseName);
            }

            return options.onName(singleTypeName.getUnicodeName(pName));
        }

        return options.onName(singleTypeName.getUnicodeName(pName));
    }

    visit(
        jsonc,
        {
            onObjectBegin(...params) {
                walkOffset(...params);

                const typeName = getName();
                const caseTypeName = getCaseName(typeName);
                const interfaceTypeNode = dtsDom.create.interface(caseTypeName);

                visitTopTypeNode({
                    onGenArrTypeNode(typeNode) {
                        typeNode.typeMembers.add(caseTypeName as dtsDom.Type);
                        typeNode.jsDocComment.push(...popAllComments());

                        // 对于数组对象元素有注释，则对象加上注释，且数组属性加上注释
                        if (typeNode.jsDocComment.length > 0) {
                            interfaceTypeNode.jsDocComment = typeNode.jsDocComment.join(
                                '\n',
                            );
                        }
                    },
                    onInterfaceTypeNode(typeNode) {
                        const propertyTypeNode = dtsDom.create.property(
                            typeName,
                            caseTypeName as dtsDom.Type,
                        );

                        typeNode.members.push(addComment(propertyTypeNode));
                    },
                });

                // 推入 interface
                typeNodeStack.push(interfaceTypeNode);
            },
            onObjectEnd(...params) {
                walkOffset(...params);

                // 取出栈顶 typeNode
                const typeNode = typeNodeStack.pop() as dtsDom.InterfaceDeclaration;

                if (!helper.isEmpty(typeNodeStack)) {
                    // 当前栈顶 node
                    const topStackTypeNode = helper.topTypeNode(typeNodeStack);

                    if (helper.isArrayTypeNode(topStackTypeNode)) {
                        topStackTypeNode.typeNodeMembers.add(typeNode);
                    } else {
                        result.push(typeNode);
                    }
                } else {
                    result.push(typeNode);
                }
            },

            onArrayBegin(...params) {
                walkOffset(...params);

                const genArrTypeNode = new ArrayType();

                visitTopTypeNode({
                    onGenArrTypeNode(typeNode) {
                        genArrTypeNode.name = typeNode.name;
                        genArrTypeNode.type = 'arrItem';
                    },
                    onInterfaceTypeNode() {
                        genArrTypeNode.name = nameStack.pop() || '';
                        genArrTypeNode.type = 'property';
                        genArrTypeNode.jsDocComment.push(...popAllComments());
                    },
                });

                genArrTypeNode.caseName = singleTypeName.getUnicodeName(
                    genArrTypeNode.name,
                );
                typeNodeStack.push(genArrTypeNode);
            },
            onArrayEnd(...params) {
                walkOffset(...params);

                if (!helper.isEmpty(typeNodeStack)) {
                    const genArrTypeNode = typeNodeStack.pop() as ArrayType;
                    const arrTypeNode = genArrTypeNode.emit();

                    // 获取现在的顶部元素
                    const topStackTypeNode = helper.topTypeNode(typeNodeStack);

                    if (helper.isArrayTypeNode(topStackTypeNode)) {
                        // 顶部是 ArrayType 的话，nodeType 一定是 ArrayTypeReference
                        topStackTypeNode.typeMembers.add(
                            arrTypeNode as dtsDom.ArrayTypeReference,
                        );
                    } else if (helper.isInterfaceTypeNode(topStackTypeNode)) {
                        // 顶部是 InterfaceDeclaration 的话，nodeType 一定是 PropertyDeclaration
                        topStackTypeNode.members.push(
                            arrTypeNode as dtsDom.PropertyDeclaration,
                        );
                    }

                    // merge array object Item
                    if (genArrTypeNode.typeNodeMembers.size > 0) {
                        result.push(
                            mergeInterfaceTypeNodes([
                                ...genArrTypeNode.typeNodeMembers,
                            ]),
                        );
                    }
                }
            },
            onObjectProperty(property: string, ...params) {
                walkOffset(...params);

                nameStack.push(property);
            },
            onLiteralValue(value: any, ...params) {
                walkOffset(...params);

                if (!helper.isEmpty(typeNodeStack)) {
                    const topStackTypeNode = helper.topTypeNode(typeNodeStack);

                    if (helper.isArrayTypeNode(topStackTypeNode)) {
                        topStackTypeNode.typeMembers.add(
                            typeof value as dtsDom.Type,
                        );
                    } else if (helper.isInterfaceTypeNode(topStackTypeNode)) {
                        const propertyTypeNode = dtsDom.create.property(
                            nameStack.pop()!,
                            typeof value as dtsDom.Type,
                        );

                        topStackTypeNode.members.push(
                            addComment(propertyTypeNode),
                        );
                    }
                }
            },
            onSeparator(charcter: string, ...params) {
                walkOffset(...params);
            },
            onComment(...params) {
                const comment = jsonc.substr(
                    preOffset,
                    helper.add(...params) - preOffset,
                );

                const commentResult = jsoncComment.parser(comment);

                comments.push(...commentResult.content);

                const topStackTypeNode = helper.topTypeNode(
                    typeNodeStack,
                ) as dtsDom.InterfaceDeclaration;

                if (
                    commentResult.kind === jsoncComment.CommentKind.Trailing &&
                    topStackTypeNode
                ) {
                    if (
                        Array.isArray(topStackTypeNode.members) &&
                        topStackTypeNode.members.length > 0
                    ) {
                        addComment(helper.topTypeNode(
                            topStackTypeNode.members,
                        ) as dtsDom.PropertyDeclaration);
                    } else {
                        addComment(topStackTypeNode);
                    }
                }

                walkOffset(...params);
            },
            onError(error: ParseErrorCode, ...params) {
                walkOffset(...params);
            },
        },
        options,
    );

    return result;
}
